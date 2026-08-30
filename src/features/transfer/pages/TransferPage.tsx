'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import {
  RejectTransferDialog,
  TransferDetailSheet,
  TransferDirectory,
} from '../components/TransfersPage'
import {
  useApproveTransferMutation,
  useDispatchTransferMutation,
  useReceiveTransferMutation,
  useRejectTransferMutation,
  useTransfersQuery,
} from '../hooks/use-transfers'
import { rejectTransferSchema, type RejectTransferFormValues } from '../schemas/transfer.schema'
import type { TransferStatus, TransferSummary } from '../types/transfer.types'

const PAGE_SIZE = 10

function resolveErrorMessage(error: unknown, fallback: string): string {
  return typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
    ? error.message
    : fallback
}

export default function TransferPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<TransferStatus | ''>('')
  const [sourceWarehouseId, setSourceWarehouseId] = useState('')
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('')
  const [page, setPage] = useState(1)
  const [inspectedTransfer, setInspectedTransfer] = useState<TransferSummary | null>(null)
  const [rejectingTransfer, setRejectingTransfer] = useState<TransferSummary | null>(null)

  const debouncedSearchText = useDebouncedValue(searchText, 350)

  const meQuery = useMeQuery()
  const transfersQuery = useTransfersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(sourceWarehouseId ? { sourceWarehouseId } : {}),
    ...(destinationWarehouseId ? { destinationWarehouseId } : {}),
  })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })

  const approveMutation = useApproveTransferMutation()
  const rejectMutation = useRejectTransferMutation()
  const dispatchMutation = useDispatchTransferMutation()
  const receiveMutation = useReceiveTransferMutation()

  const rejectForm = useForm<RejectTransferFormValues>({
    resolver: zodResolver(rejectTransferSchema),
    defaultValues: { reason: '' },
  })

  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        id: warehouse.id,
        name: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )

  // TransferListQuery has no searchTerm, so the keyword narrows the current page locally.
  const items = useMemo(() => {
    const allItems = transfersQuery.data?.items ?? []
    const keyword = debouncedSearchText.trim().toLowerCase()
    if (!keyword) return allItems

    return allItems.filter((transfer) =>
      [transfer.transferCode, transfer.sourceWarehouseName, transfer.destinationWarehouseName].some(
        (value) => value.toLowerCase().includes(keyword)
      )
    )
  }, [transfersQuery.data?.items, debouncedSearchText])

  function updateFilter<TValue>(setValue: (value: TValue) => void, value: TValue) {
    setValue(value)
    setPage(1)
  }

  function handleRejectDialogOpenChange(open: boolean) {
    if (!open) {
      setRejectingTransfer(null)
      rejectForm.reset({ reason: '' })
    }
  }

  async function runTransferAction(
    transfer: TransferSummary,
    action: (transferId: string) => Promise<unknown>,
    successMessage: string,
    fallbackMessage: string
  ) {
    try {
      await action(transfer.id)
      toast.success(successMessage)
    } catch (error) {
      toast.error(resolveErrorMessage(error, fallbackMessage))
    }
  }

  async function handleReject(values: RejectTransferFormValues) {
    if (!rejectingTransfer) return

    try {
      await rejectMutation.mutateAsync({
        transferId: rejectingTransfer.id,
        request: { reason: values.reason },
      })
      toast.success('Đã từ chối phiếu điều chuyển.')
      handleRejectDialogOpenChange(false)
    } catch (error) {
      toast.error(resolveErrorMessage(error, 'Không thể từ chối phiếu. Vui lòng thử lại.'))
    }
  }

  return (
    <>
      <TransferDirectory
        items={items}
        totalCount={transfersQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        sourceWarehouseId={sourceWarehouseId}
        destinationWarehouseId={destinationWarehouseId}
        warehouseOptions={warehouseOptions}
        permissions={meQuery.data?.permissions ?? []}
        isLoading={transfersQuery.isLoading}
        isFetching={transfersQuery.isFetching}
        isError={transfersQuery.isError}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onSourceWarehouseChange={(value) => updateFilter(setSourceWarehouseId, value)}
        onDestinationWarehouseChange={(value) => updateFilter(setDestinationWarehouseId, value)}
        onPageChange={setPage}
        onRetry={() => void transfersQuery.refetch()}
        onInspect={setInspectedTransfer}
        onApprove={(transfer) =>
          void runTransferAction(
            transfer,
            approveMutation.mutateAsync,
            'Đã duyệt phiếu điều chuyển.',
            'Không thể duyệt phiếu. Vui lòng thử lại.'
          )
        }
        onReject={setRejectingTransfer}
        onDispatch={(transfer) =>
          void runTransferAction(
            transfer,
            dispatchMutation.mutateAsync,
            'Đã xuất hàng khỏi kho nguồn.',
            'Không thể xuất hàng. Vui lòng thử lại.'
          )
        }
        onReceive={(transfer) =>
          void runTransferAction(
            transfer,
            receiveMutation.mutateAsync,
            'Đã nhận hàng, tồn kho được cập nhật.',
            'Không thể nhận hàng. Vui lòng thử lại.'
          )
        }
      />
      <TransferDetailSheet
        transfer={inspectedTransfer}
        onOpenChange={(open) => {
          if (!open) setInspectedTransfer(null)
        }}
      />
      <RejectTransferDialog
        transfer={rejectingTransfer}
        form={rejectForm}
        isPending={rejectMutation.isPending}
        onOpenChange={handleRejectDialogOpenChange}
        onSubmit={handleReject}
      />
    </>
  )
}
