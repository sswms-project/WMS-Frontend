'use client'

import { useState } from 'react'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useLocalStorage } from '@/hooks/use-local-storage'
import {
  toOperationalDateTimeEnd,
  toOperationalDateTimeStart,
} from '@/features/inbound-request/utils/inbound-request-format'
import {
  InboundPageHeader,
  InboundMasterDetail,
  InboundGoodsPreview,
  INBOUND_DETAIL_STORAGE_KEY,
} from '../components/InboundWorkspace'
import { receiptGoodsPreviewRows } from '../utils/inbound-goods-preview'
import { PutawayDirectory, type PutawayAssignmentFilter } from '../components/PutawayPage'
import { AssignWarehouseTaskDialog } from '../components/TaskAssignment'
import { useAssignWarehouseTask } from '../hooks/use-assign-warehouse-task'
import { usePutawayTasksQuery, useGoodsReceiptQuery } from '../hooks/use-inbound'
import { useWarehouseTaskAssignmentAccess } from '../hooks/use-warehouse-task-assignment-access'
import type { GoodsReceiptSummary } from '../types/inbound.types'

export default function InboundPutawayPage() {
  const meQuery = useMeQuery()
  const { currentUserId, canAssign } = useWarehouseTaskAssignmentAccess()
  const [searchText, setSearchText] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [previewId, setPreviewId] = useState('')
  const [isDetailExpanded, setIsDetailExpanded] = useLocalStorage(INBOUND_DETAIL_STORAGE_KEY, false)
  const [assignmentFilter, setAssignmentFilter] = useState<PutawayAssignmentFilter>('all')
  const assignment = useAssignWarehouseTask()
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = usePutawayTasksQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(createdFrom ? { createdFrom: toOperationalDateTimeStart(createdFrom) } : {}),
    ...(createdTo ? { createdTo: toOperationalDateTimeEnd(createdTo) } : {}),
    ...(canAssign && assignmentFilter === 'unassigned' ? { unassigned: true } : {}),
  })

  const preview =
    !query.isError && !query.isPlaceholderData
      ? query.data?.items.find((item) => item.id === previewId)
      : undefined
  const previewQuery = useGoodsReceiptQuery(isDetailExpanded && preview ? preview.id : '')

  function openAssign(receipt: GoodsReceiptSummary) {
    assignment.open({
      kind: 'PutAway',
      id: receipt.id,
      referenceCode: receipt.receiptCode,
      warehouseId: receipt.warehouseId,
      warehouseName: receipt.warehouseName,
      currentAssigneeId: receipt.putAwayAssignedTo,
      currentAssigneeName: receipt.putAwayAssignedToName,
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <InboundPageHeader
        title="Cất hàng"
        canViewRequests={meQuery.data?.permissions.includes(P.INBOUND_REQUESTS_VIEW) ?? false}
        canViewReceipts={meQuery.data?.permissions.includes(P.GOODS_RECEIPTS_VIEW) ?? false}
      />
      <Card size="sm" className="border-l-primary w-full shrink-0 border-l-2 sm:max-w-xs">
        <CardContent className="flex min-h-16 items-center justify-between gap-2">
          <p className="text-sm font-medium">Phiếu chờ cất</p>
          {query.isFetching ? (
            <Skeleton className="h-7 w-10" aria-hidden="true" />
          ) : (
            <p className="text-primary shrink-0 text-2xl font-semibold tabular-nums">
              {query.isError ? '—' : (query.data?.totalCount ?? 0).toLocaleString('vi-VN')}
            </p>
          )}
        </CardContent>
      </Card>
      <InboundMasterDetail
        expanded={isDetailExpanded}
        onExpandedChange={setIsDetailExpanded}
        referenceCode={preview?.receiptCode}
        detail={
          <InboundGoodsPreview
            key={preview?.id ?? ''}
            selected={Boolean(preview)}
            rows={receiptGoodsPreviewRows(previewQuery.data?.items ?? [])}
            isReceipt
            isLoading={Boolean(preview) && previewQuery.isLoading}
            isError={previewQuery.isError}
            onRetry={() => void previewQuery.refetch()}
          />
        }
      >
        <PutawayDirectory
          previewId={preview?.id}
          onPreview={(item) => {
            setPreviewId(item.id)
          }}
          items={query.data?.items ?? []}
          totalCount={query.data?.totalCount ?? 0}
          page={page}
          pageSize={pageSize}
          searchText={searchText}
          createdFrom={createdFrom}
          createdTo={createdTo}
          isLoading={query.isFetching}
          isFetching={query.isFetching}
          isError={query.isError}
          onSearchChange={(value) => {
            setSearchText(value)
            setPage(1)
          }}
          onCreatedFromChange={(value) => {
            setCreatedFrom(value)
            setPage(1)
          }}
          onCreatedToChange={(value) => {
            setCreatedTo(value)
            setPage(1)
          }}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value)
            setPage(1)
          }}
          onRetry={() => void query.refetch()}
          currentUserId={currentUserId}
          canAssign={canAssign}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={(value) => {
            setAssignmentFilter(value)
            setPage(1)
          }}
          onAssign={openAssign}
        />
      </InboundMasterDetail>
      <AssignWarehouseTaskDialog
        target={assignment.target}
        form={assignment.form}
        staff={assignment.staff}
        isLoadingStaff={assignment.isLoadingStaff}
        isErrorStaff={assignment.isErrorStaff}
        isFetchingStaff={assignment.isFetchingStaff}
        onRetryStaff={assignment.onRetryStaff}
        isPending={assignment.isPending}
        onOpenChange={(open) => !open && assignment.close()}
        onSubmit={assignment.onSubmit}
      />
    </div>
  )
}
