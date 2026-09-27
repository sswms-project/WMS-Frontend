'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { getApiErrorMessage } from '@/lib/api-error'
import { InboundPageHeader } from '../components/InboundWorkspace'
import { PutawayDirectory, type PutawayAssignmentFilter } from '../components/PutawayPage'
import {
  AssignWarehouseTaskDialog,
  type AssignWarehouseTaskTarget,
} from '../components/TaskAssignment'
import { useAssignPutawayTaskMutation, usePutawayTasksQuery } from '../hooks/use-inbound'
import { useWarehouseTaskAssignmentAccess } from '../hooks/use-warehouse-task-assignment-access'
import type { GoodsReceiptSummary } from '../types/inbound.types'

export default function InboundPutawayPage() {
  const { currentUserId, canAssign } = useWarehouseTaskAssignmentAccess()
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [assignmentFilter, setAssignmentFilter] = useState<PutawayAssignmentFilter>('all')
  const [assignTarget, setAssignTarget] = useState<AssignWarehouseTaskTarget | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = usePutawayTasksQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(canAssign && assignmentFilter === 'unassigned' ? { unassigned: true } : {}),
  })
  const assignMutation = useAssignPutawayTaskMutation()

  function openAssign(receipt: GoodsReceiptSummary) {
    setAssignTarget({
      kind: 'PutAway',
      id: receipt.id,
      referenceCode: receipt.receiptCode,
      warehouseId: receipt.warehouseId,
      warehouseName: receipt.warehouseName,
      currentAssigneeId: receipt.putAwayAssignedTo,
      currentAssigneeName: receipt.putAwayAssignedToName,
    })
  }

  async function assign(values: { staffId: string; reason: string }) {
    if (!assignTarget) return
    try {
      await assignMutation.mutateAsync({
        receiptId: assignTarget.id,
        request: {
          staffId: values.staffId,
          expectedStaffId: assignTarget.currentAssigneeId,
          reason: values.reason || null,
        },
      })
      toast.success(
        assignTarget.currentAssigneeId
          ? `Đã giao lại việc cất hàng ${assignTarget.referenceCode}.`
          : `Đã giao việc cất hàng ${assignTarget.referenceCode}.`
      )
      setAssignTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể giao việc cất hàng. Vui lòng thử lại.'))
    }
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
        target={assignTarget}
        isPending={assignMutation.isPending}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        onSubmit={(values) => void assign(values)}
      />
    </div>
  )
}
