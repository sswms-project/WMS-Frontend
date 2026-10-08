'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { RelocationTaskDialog, WarehouseTaskDirectory } from '../components/WarehouseTaskDirectory'
import {
  useMyWarehouseTaskHistoryQuery,
  useWarehouseTaskDetailQuery,
} from '../hooks/use-warehouse-task'
import type { ExecuteWarehouseRelocationFormValues } from '../schemas/warehouse-relocation.schema'
import type {
  MyWarehouseTask,
  WarehouseTaskDeadlineStatus,
  WarehouseTaskType,
} from '../types/warehouse-task.types'

const PAGE_SIZE = 20

export default function MyWarehouseTaskHistoryPage() {
  const [page, setPage] = useState(1)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskTypeFilter, setTaskTypeFilter] = useState<WarehouseTaskType | ''>('')
  const [executionStatusFilter, setExecutionStatusFilter] = useState<
    MyWarehouseTask['executionStatus'] | ''
  >('')
  const [deadlineFilter, setDeadlineFilter] = useState<WarehouseTaskDeadlineStatus | ''>('')
  const meQuery = useMeQuery()
  const managesWarehouseTasks = (meQuery.data?.permissions ?? []).includes(
    P.WAREHOUSE_TASKS_VIEW_ALL
  )
  const query = useMyWarehouseTaskHistoryQuery(
    {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      taskType: taskTypeFilter || undefined,
      executionStatus: executionStatusFilter || undefined,
      deadlineStatus: deadlineFilter || undefined,
    },
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
        title={managesWarehouseTasks ? 'Lịch sử công việc kho' : 'Công việc đã xử lý'}
        description="Các công việc đã hoàn tất hoặc đã hủy; không bao gồm nhật ký thao tác hệ thống."
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        stats={
          query.data?.stats ?? {
            unassignedCount: 0,
            queuedCount: 0,
            inProgressCount: 0,
            pausedCount: 0,
            dueSoonCount: 0,
            overdueCount: 0,
          }
        }
        statsMode={managesWarehouseTasks ? 'managed' : 'mine'}
        showStats={false}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        headerAction={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <NativeSelect
              aria-label="Lọc lịch sử theo loại công việc"
              value={taskTypeFilter}
              onChange={(event) => {
                setTaskTypeFilter(event.target.value as WarehouseTaskType | '')
                setPage(1)
              }}
              className="w-40"
            >
              <NativeSelectOption value="">Mọi loại việc</NativeSelectOption>
              <NativeSelectOption value="Receiving">Nhận hàng</NativeSelectOption>
              <NativeSelectOption value="PutAway">Cất hàng</NativeSelectOption>
              <NativeSelectOption value="CycleCount">Kiểm kê</NativeSelectOption>
              <NativeSelectOption value="Relocation">Điều chuyển</NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              aria-label="Lọc lịch sử theo trạng thái"
              value={executionStatusFilter}
              onChange={(event) => {
                setExecutionStatusFilter(
                  event.target.value as MyWarehouseTask['executionStatus'] | ''
                )
                setPage(1)
              }}
              className="w-40"
            >
              <NativeSelectOption value="">Mọi trạng thái</NativeSelectOption>
              <NativeSelectOption value="Completed">Hoàn tất</NativeSelectOption>
              <NativeSelectOption value="Cancelled">Đã hủy</NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              aria-label="Lọc lịch sử theo thời hạn"
              value={deadlineFilter}
              onChange={(event) => {
                setDeadlineFilter(event.target.value as WarehouseTaskDeadlineStatus | '')
                setPage(1)
              }}
              className="w-40"
            >
              <NativeSelectOption value="">Mọi thời hạn</NativeSelectOption>
              <NativeSelectOption value="CompletedOnTime">Đúng hạn</NativeSelectOption>
              <NativeSelectOption value="CompletedLate">Trễ hạn</NativeSelectOption>
              <NativeSelectOption value="Cancelled">Đã hủy</NativeSelectOption>
            </NativeSelect>
          </div>
        }
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
        canOverrideDestination={false}
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
