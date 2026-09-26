'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { WarehouseTaskDirectory } from '../components/WarehouseTaskDirectory'
import {
  useManageMyWarehouseTaskMutation,
  useMyWarehouseTasksQuery,
} from '../hooks/use-warehouse-task'
import type { MyWarehouseTask } from '../types/warehouse-task.types'

const PAGE_SIZE = 20

export default function MyWarehouseTasksPage() {
  const [page, setPage] = useState(1)
  const query = useMyWarehouseTasksQuery({ pageNumber: page, pageSize: PAGE_SIZE })
  const action = useManageMyWarehouseTaskMutation()
  async function manage(task: MyWarehouseTask, type: 'Start' | 'Pause' | 'Return') {
    const reason =
      type === 'Start'
        ? undefined
        : window.prompt(type === 'Pause' ? 'Lý do tạm dừng' : 'Lý do trả về hàng đợi')?.trim()
    if (type !== 'Start' && !reason) return
    try {
      await action.mutateAsync({ taskType: task.taskType, taskId: task.id, action: type, reason })
      toast.success(
        type === 'Start'
          ? 'Đã bắt đầu công việc.'
          : type === 'Pause'
            ? 'Đã tạm dừng công việc.'
            : 'Đã trả công việc về hàng đợi.'
      )
    } catch {
      toast.error('Không thể cập nhật công việc. Vui lòng thử lại.')
    }
  }
  return (
    <WarehouseTaskDirectory
      title="Công việc của tôi"
      description="Chỉ hiển thị các nhiệm vụ kho được giao cho bạn."
      items={query.data?.items ?? []}
      totalCount={query.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      isError={query.isError}
      onPageChange={setPage}
      onRetry={() => void query.refetch()}
      onAction={(task, type) => void manage(task, type)}
    />
  )
}
