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
  ApproveTransferDialog,
  ReceiveTransferDialog,
  DispatchTransferDialog,
  TransferDetailSheet,
  TransferDirectory,
} from '../components/TransfersPage'
import {
  useApproveTransferMutation,
  useDispatchTransferMutation,
  useReceiveTransferMutation,
  useRejectTransferMutation,
  useTransferQuery,
  useTransfersQuery,
} from '../hooks/use-transfers'
import {
  approveTransferSchema,
  receiveTransferSchema,
  rejectTransferSchema,
  type ApproveTransferFormValues,
  type ReceiveTransferFormValues,
  type RejectTransferFormValues,
} from '../schemas/transfer.schema'
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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [inspectedTransfer, setInspectedTransfer] = useState<TransferSummary | null>(null)
  const [rejectingTransfer, setRejectingTransfer] = useState<TransferSummary | null>(null)
  const [approvingTransfer, setApprovingTransfer] = useState<TransferSummary | null>(null)
  const [receivingTransfer, setReceivingTransfer] = useState<TransferSummary | null>(null)
  const [dispatchingTransfer, setDispatchingTransfer] = useState<TransferSummary | null>(null)

  const debouncedSearchText = useDebouncedValue(searchText, 350)

  const meQuery = useMeQuery()
  const transfersQuery = useTransfersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(sourceWarehouseId ? { sourceWarehouseId } : {}),
    ...(destinationWarehouseId ? { destinationWarehouseId } : {}),
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  })
  const transferQuery = useTransferQuery(inspectedTransfer?.id ?? null)
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
  const approveForm = useForm<ApproveTransferFormValues>({
    resolver: zodResolver(approveTransferSchema),
    defaultValues: { note: '', lines: [] },
  })
  const receiveForm = useForm<ReceiveTransferFormValues>({
    resolver: zodResolver(receiveTransferSchema),
    defaultValues: { lines: [] },
  })

  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        id: warehouse.id,
        name: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )

  const items = transfersQuery.data?.items ?? []

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

  function openApprove(transfer: TransferSummary) {
    setApprovingTransfer(transfer)
    approveForm.reset({
      note: '',
      lines: transfer.items.map((item) => ({
        stockTransferItemId: item.id,
        productName: item.productName,
        requestedQuantity: item.quantity,
        approvedQuantity: item.quantity,
      })),
    })
  }

  async function handleApprove(values: ApproveTransferFormValues) {
    if (!approvingTransfer) return
    try {
      await approveMutation.mutateAsync({
        transferId: approvingTransfer.id,
        request: {
          note: values.note || null,
          items: values.lines.map(({ stockTransferItemId, approvedQuantity }) => ({
            stockTransferItemId,
            approvedQuantity,
          })),
        },
      })
      toast.success('Đã duyệt phiếu điều chuyển.')
      setApprovingTransfer(null)
    } catch (error) {
      toast.error(resolveErrorMessage(error, 'Không thể duyệt phiếu. Vui lòng thử lại.'))
    }
  }

  function openReceive(transfer: TransferSummary) {
    setReceivingTransfer(transfer)
    receiveForm.reset({
      lines: transfer.items.map((item) => ({
        stockTransferItemId: item.id,
        productName: item.productName,
        dispatchedQuantity: item.dispatchedQuantity,
        receivedQuantity: item.dispatchedQuantity,
        damagedQuantity: 0,
        missingQuantity: 0,
      })),
    })
  }

  async function handleReceive(values: ReceiveTransferFormValues) {
    if (!receivingTransfer) return
    try {
      await receiveMutation.mutateAsync({
        transferId: receivingTransfer.id,
        request: {
          items: values.lines.map(
            ({ stockTransferItemId, receivedQuantity, damagedQuantity, missingQuantity }) => ({
              stockTransferItemId,
              receivedQuantity,
              damagedQuantity,
              missingQuantity,
            })
          ),
        },
      })
      toast.success('Đã nhận hàng, tồn kho được cập nhật.')
      setReceivingTransfer(null)
    } catch (error) {
      toast.error(resolveErrorMessage(error, 'Không thể nhận hàng. Vui lòng thử lại.'))
    }
  }

  async function handleDispatch() {
    if (!dispatchingTransfer) return
    await runTransferAction(
      dispatchingTransfer,
      dispatchMutation.mutateAsync,
      'Đã xuất hàng khỏi kho nguồn.',
      'Không thể xuất hàng. Vui lòng thử lại.'
    )
    setDispatchingTransfer(null)
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
        dateFrom={dateFrom}
        dateTo={dateTo}
        warehouseOptions={warehouseOptions}
        permissions={meQuery.data?.permissions ?? []}
        currentUserId={meQuery.data?.id ?? null}
        isLoading={transfersQuery.isLoading}
        isFetching={transfersQuery.isFetching}
        isError={transfersQuery.isError}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onSourceWarehouseChange={(value) => updateFilter(setSourceWarehouseId, value)}
        onDestinationWarehouseChange={(value) => updateFilter(setDestinationWarehouseId, value)}
        onDateFromChange={(value) => updateFilter(setDateFrom, value)}
        onDateToChange={(value) => updateFilter(setDateTo, value)}
        onPageChange={setPage}
        onRetry={() => void transfersQuery.refetch()}
        onInspect={setInspectedTransfer}
        onApprove={openApprove}
        onReject={setRejectingTransfer}
        onDispatch={setDispatchingTransfer}
        onReceive={openReceive}
      />
      <TransferDetailSheet
        transfer={transferQuery.data ?? null}
        isLoading={transferQuery.isLoading}
        isError={transferQuery.isError}
        onRetry={() => void transferQuery.refetch()}
        onOpenChange={(open) => {
          if (!open) setInspectedTransfer(null)
        }}
      />
      <ApproveTransferDialog
        transfer={approvingTransfer}
        form={approveForm}
        isPending={approveMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setApprovingTransfer(null)
        }}
        onSubmit={handleApprove}
      />
      <ReceiveTransferDialog
        transfer={receivingTransfer}
        form={receiveForm}
        isPending={receiveMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setReceivingTransfer(null)
        }}
        onSubmit={handleReceive}
      />
      <DispatchTransferDialog
        transfer={dispatchingTransfer}
        isPending={dispatchMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDispatchingTransfer(null)
        }}
        onConfirm={() => void handleDispatch()}
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
