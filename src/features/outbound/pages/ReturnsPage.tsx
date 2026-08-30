'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { OutboundWorkspaceNavigation } from '@/components/operations/OutboundWorkspaceNavigation'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { RejectReturnDialog, ReturnDetailSheet, ReturnDirectory } from '../components/ReturnsPage'
import {
  useApproveReturnMutation,
  useRejectReturnMutation,
  useReturnsQuery,
  useReturnQuery,
} from '../hooks/use-outbound-orders'
import { rejectReturnSchema, type RejectReturnFormValues } from '../schemas/reject-return.schema'
import type { ReturnStatus, ReturnSummary } from '../types/outbound.types'

const PAGE_SIZE = 10

export default function ReturnsPage() {
  const meQuery = useMeQuery()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<ReturnStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [inspectedItem, setInspectedItem] = useState<ReturnSummary | null>(null)
  const [rejectingItem, setRejectingItem] = useState<ReturnSummary | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const returnsQuery = useReturnsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
    ...(status ? { status } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })
  const returnDetailQuery = useReturnQuery(inspectedItem?.id ?? null)
  const approveMutation = useApproveReturnMutation()
  const rejectMutation = useRejectReturnMutation()
  const rejectForm = useForm<RejectReturnFormValues>({
    resolver: zodResolver(rejectReturnSchema),
    defaultValues: { reason: '' },
  })

  async function approve(item: ReturnSummary) {
    try {
      await approveMutation.mutateAsync(item.id)
      toast.success('Đã duyệt phiếu hoàn.')
    } catch {
      toast.error('Không thể duyệt phiếu hoàn.')
    }
  }
  async function reject(values: RejectReturnFormValues) {
    if (!rejectingItem) return
    try {
      await rejectMutation.mutateAsync({ returnId: rejectingItem.id, request: values })
      toast.success('Đã từ chối phiếu hoàn.')
      setRejectingItem(null)
      rejectForm.reset()
    } catch {
      toast.error('Không thể từ chối phiếu hoàn.')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <OutboundWorkspaceNavigation
        currentView="returns"
        permissions={meQuery.data?.permissions ?? []}
      />
      <ReturnDirectory
        items={returnsQuery.data?.items ?? []}
        totalCount={returnsQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        warehouseId={warehouseId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        warehouses={(warehousesQuery.data?.items ?? []).map((warehouse) => ({
          id: warehouse.id,
          label: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
        }))}
        permissions={meQuery.data?.permissions ?? []}
        currentUserId={meQuery.data?.id ?? null}
        isLoading={returnsQuery.isLoading}
        isFetching={returnsQuery.isFetching}
        isError={returnsQuery.isError}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        onWarehouseChange={(value) => {
          setWarehouseId(value)
          setPage(1)
        }}
        onDateFromChange={(value) => {
          setDateFrom(value)
          setPage(1)
        }}
        onDateToChange={(value) => {
          setDateTo(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onInspect={setInspectedItem}
        onApprove={(item) => void approve(item)}
        onReject={setRejectingItem}
        onRetry={() => void returnsQuery.refetch()}
      />
      <ReturnDetailSheet
        item={returnDetailQuery.data ?? null}
        isLoading={returnDetailQuery.isLoading}
        isError={returnDetailQuery.isError}
        onRetry={() => void returnDetailQuery.refetch()}
        onOpenChange={(open) => {
          if (!open) setInspectedItem(null)
        }}
      />
      <RejectReturnDialog
        item={rejectingItem}
        form={rejectForm}
        isPending={rejectMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingItem(null)
            rejectForm.reset()
          }
        }}
        onSubmit={(values) => void reject(values)}
      />
    </div>
  )
}
