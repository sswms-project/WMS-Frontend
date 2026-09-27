'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { InboundPageHeader } from '../components/InboundWorkspace'
import { PutawayDirectory, type PutawayAssignmentFilter } from '../components/PutawayPage'
import { AssignWarehouseTaskDialog } from '../components/TaskAssignment'
import { useAssignWarehouseTask } from '../hooks/use-assign-warehouse-task'
import { usePutawayTasksQuery } from '../hooks/use-inbound'
import { useWarehouseTaskAssignmentAccess } from '../hooks/use-warehouse-task-assignment-access'
import type { GoodsReceiptSummary } from '../types/inbound.types'

export default function InboundPutawayPage() {
  const { currentUserId, canAssign } = useWarehouseTaskAssignmentAccess()
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [assignmentFilter, setAssignmentFilter] = useState<PutawayAssignmentFilter>('all')
  const assignment = useAssignWarehouseTask()
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = usePutawayTasksQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(canAssign && assignmentFilter === 'unassigned' ? { unassigned: true } : {}),
  })

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
      <InboundPageHeader title="Cất hàng" />
      <PutawayDirectory
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={pageSize}
        searchText={searchText}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        onSearchChange={(value) => {
          setSearchText(value)
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
