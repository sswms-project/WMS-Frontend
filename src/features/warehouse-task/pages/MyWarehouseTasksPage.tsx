'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { P } from '@/config/permissionCodes'
import { USER_ROLES } from '@/config/roles'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth.store'
import { WarehouseTaskDirectory } from '../components/WarehouseTaskDirectory'
import {
  useManageMyWarehouseTaskMutation,
  useMyWarehouseTasksQuery,
} from '../hooks/use-warehouse-task'
import type { MyWarehouseTask, WarehouseTaskAction } from '../types/warehouse-task.types'

const PAGE_SIZE = 20
const SUCCESS_MESSAGES: Record<WarehouseTaskAction, string> = {
  Start: 'Đã bắt đầu công việc.',
  Pause: 'Đã tạm dừng công việc.',
  Return: 'Đã trả công việc về cho quản lý kho.',
}

export default function MyWarehouseTasksPage() {
  const [page, setPage] = useState(1)
  const [pendingReason, setPendingReason] = useState<{
    task: MyWarehouseTask
    action: 'Pause' | 'Return'
  } | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const isWarehouseStaff = useAuthStore((state) => state.user?.role === USER_ROLES.WarehouseStaff)
  const meQuery = useMeQuery()
  const canManageOwnTasks =
    isWarehouseStaff && (meQuery.data?.permissions ?? []).includes(P.WAREHOUSE_TASKS_MANAGE_OWN)
  const managesWarehouseTasks = (meQuery.data?.permissions ?? []).includes(
    P.WAREHOUSE_TASKS_VIEW_ALL
  )
  const query = useMyWarehouseTasksQuery(
    { pageNumber: page, pageSize: PAGE_SIZE },
    managesWarehouseTasks ? 'managed' : 'mine'
  )
  const action = useManageMyWarehouseTaskMutation()

  async function run(task: MyWarehouseTask, type: WarehouseTaskAction, note?: string) {
    try {
      await action.mutateAsync({
        taskType: task.taskType,
        taskId: task.id,
        action: type,
        reason: note,
      })
      toast.success(SUCCESS_MESSAGES[type])
      return true
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật công việc. Vui lòng thử lại.'))
      return false
    }
  }

  function manage(task: MyWarehouseTask, type: WarehouseTaskAction) {
    if (type === 'Start') {
      void run(task, type)
      return
    }
    setReason('')
    setReasonError('')
    setPendingReason({ task, action: type })
  }

  async function confirmReason() {
    if (!pendingReason) return
    const normalized = reason.trim()
    if (!normalized) {
      setReasonError('Vui lòng nhập lý do.')
      return
    }
    if (normalized.length > 500) {
      setReasonError('Lý do không được vượt quá 500 ký tự.')
      return
    }
    if (await run(pendingReason.task, pendingReason.action, normalized)) setPendingReason(null)
  }

  return (
    <>
      <WarehouseTaskDirectory
        title={managesWarehouseTasks ? 'Công việc kho' : 'Công việc của tôi'}
        description={
          managesWarehouseTasks
            ? 'Theo dõi công việc và người phụ trách trong các kho được phân quyền quản lý.'
            : 'Chỉ hiển thị các nhiệm vụ kho được giao cho bạn. Mỗi lúc chỉ làm một việc.'
        }
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        onPageChange={setPage}
        onRetry={() => void query.refetch()}
        canManage={canManageOwnTasks}
        onAction={manage}
      />
      <Dialog
        open={Boolean(pendingReason)}
        onOpenChange={(open) => !open && !action.isPending && setPendingReason(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingReason?.action === 'Pause' ? 'Tạm dừng công việc' : 'Trả lại công việc'}
            </DialogTitle>
            <DialogDescription>
              {pendingReason?.action === 'Pause'
                ? 'Công việc vẫn thuộc về bạn và có thể tiếp tục sau.'
                : 'Công việc sẽ trở về trạng thái chưa giao để quản lý kho giao cho người khác.'}{' '}
              <span className="font-mono">{pendingReason?.task.referenceCode}</span>
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(reasonError)}>
            <FieldLabel htmlFor="warehouse-task-reason">Lý do</FieldLabel>
            <Textarea
              id="warehouse-task-reason"
              rows={3}
              maxLength={500}
              value={reason}
              aria-invalid={Boolean(reasonError)}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError('')
              }}
            />
            <FieldError>{reasonError}</FieldError>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={action.isPending}
              onClick={() => setPendingReason(null)}
            >
              Hủy
            </Button>
            <Button type="button" disabled={action.isPending} onClick={() => void confirmReason()}>
              {action.isPending ? 'Đang lưu…' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
