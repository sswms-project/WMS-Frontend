'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { RelocationTaskDialog, WarehouseTaskDirectory } from '../components/WarehouseTaskDirectory'
import {
  useMyWarehouseTaskHistoryQuery,
  useWarehouseTaskDetailQuery,
} from '../hooks/use-warehouse-task'
import type { ExecuteWarehouseRelocationFormValues } from '../schemas/warehouse-relocation.schema'

const PAGE_SIZE = 20

export default function MyWarehouseTaskHistoryPage() {
  const [page, setPage] = useState(1)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const meQuery = useMeQuery()
  const managesWarehouseTasks = (meQuery.data?.permissions ?? []).includes(
    P.WAREHOUSE_TASKS_VIEW_ALL
  )
  const query = useMyWarehouseTaskHistoryQuery(
    { pageNumber: page, pageSize: PAGE_SIZE },
    managesWarehouseTasks ? 'managed' : 'mine'
  )
  const scope = managesWarehouseTasks ? 'managed' : 'mine'
  const detailQuery = useWarehouseTaskDetailQuery(selectedTaskId, scope)
  const readOnlyForm = useForm<ExecuteWarehouseRelocationFormValues>({
    defaultValues: { lineId: '', destinationSlotId: '', quantity: 1, overrideReason: '' },
  })
  return (
    <>
      <WarehouseTaskDirectory
        title={managesWarehouseTasks ? 'Lịch sử công việc kho' : 'Lịch sử công việc'}
        description="Các nhiệm vụ đã hoàn tất hoặc đã được xử lý."
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        onPageChange={setPage}
        onRetry={() => void query.refetch()}
        onOpenRelocation={(task) => setSelectedTaskId(task.id)}
      />
      <RelocationTaskDialog
        open={Boolean(selectedTaskId)}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        scope={scope}
        canAssign={false}
        canExecute={false}
        staffOptions={[]}
        assignmentStaffId=""
        assignmentReason=""
        recommendations={[]}
        recommendationsLoading={false}
        executeForm={readOnlyForm}
        isAssigning={false}
        isExecuting={false}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        onRetry={() => void detailQuery.refetch()}
        onAssignmentStaffChange={() => undefined}
        onAssignmentReasonChange={() => undefined}
        onAssign={() => undefined}
        onLineChange={() => undefined}
        onExecute={() => undefined}
      />
    </>
  )
}
