'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import {
  RejectGoodsReturnRequestDialog,
  GoodsReturnRequestDetailSheet,
  GoodsReturnRequestDirectory,
} from '../components/GoodsReturnRequestsPage'
import {
  useApproveGoodsReturnRequestMutation,
  useRejectGoodsReturnRequestMutation,
  useGoodsReturnRequestsQuery,
  useGoodsReturnRequestQuery,
} from '../hooks/use-stock-issue-requests'
import {
  rejectGoodsReturnRequestSchema,
  type RejectGoodsReturnRequestFormValues,
} from '../schemas/reject-return.schema'
import type {
  GoodsReturnRequestStatus,
  GoodsReturnRequestSummary,
} from '../types/stock-issue.types'

const PAGE_SIZE = 10

export default function GoodsReturnRequestsPage() {
  const meQuery = useMeQuery()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<GoodsReturnRequestStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [inspectedItem, setInspectedItem] = useState<GoodsReturnRequestSummary | null>(null)
  const [rejectingItem, setRejectingItem] = useState<GoodsReturnRequestSummary | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const goodsReturnRequestsQuery = useGoodsReturnRequestsQuery({
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
  const returnDetailQuery = useGoodsReturnRequestQuery(inspectedItem?.id ?? null)
  const approveMutation = useApproveGoodsReturnRequestMutation()
  const rejectMutation = useRejectGoodsReturnRequestMutation()
  const rejectForm = useForm<RejectGoodsReturnRequestFormValues>({
    resolver: zodResolver(rejectGoodsReturnRequestSchema),
    defaultValues: { reason: '' },
  })

  async function approve(item: GoodsReturnRequestSummary) {
    try {
      await approveMutation.mutateAsync(item.id)
      toast.success('Đã duyệt yêu cầu trả hàng.')
    } catch {
      toast.error('Không thể duyệt yêu cầu trả hàng.')
    }
  }
  async function reject(values: RejectGoodsReturnRequestFormValues) {
    if (!rejectingItem) return
    try {
      await rejectMutation.mutateAsync({ goodsReturnRequestId: rejectingItem.id, request: values })
      toast.success('Đã từ chối yêu cầu trả hàng.')
      setRejectingItem(null)
      rejectForm.reset()
    } catch {
      toast.error('Không thể từ chối yêu cầu trả hàng.')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <GoodsReturnRequestDirectory
        items={goodsReturnRequestsQuery.data?.items ?? []}
        totalCount={goodsReturnRequestsQuery.data?.totalCount ?? 0}
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
        isLoading={goodsReturnRequestsQuery.isLoading}
        isFetching={goodsReturnRequestsQuery.isFetching}
        isError={goodsReturnRequestsQuery.isError}
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
        onRetry={() => void goodsReturnRequestsQuery.refetch()}
      />
      <GoodsReturnRequestDetailSheet
        item={returnDetailQuery.data ?? null}
        isLoading={returnDetailQuery.isLoading}
        isError={returnDetailQuery.isError}
        onRetry={() => void returnDetailQuery.refetch()}
        onOpenChange={(open) => {
          if (!open) setInspectedItem(null)
        }}
      />
      <RejectGoodsReturnRequestDialog
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
