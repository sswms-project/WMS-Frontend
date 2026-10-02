import { CircleDashed, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatOperationalDateTime } from '@/features/inbound-request/utils/inbound-request-format'
import type { WarehouseTaskExecutionStatus } from '../../types/inbound.types'

const EXECUTION_LABELS: Record<WarehouseTaskExecutionStatus, string> = {
  Queued: 'Chờ bắt đầu',
  InProgress: 'Đang làm',
  Paused: 'Tạm dừng',
  Completed: 'Hoàn tất',
}

interface TaskAssigneeCellProps {
  readonly assigneeName: string | null
  readonly assignedAt?: string | null
  readonly executionStatus?: WarehouseTaskExecutionStatus
  readonly isCurrentUser?: boolean
}

export function TaskAssigneeCell({
  assigneeName,
  assignedAt,
  executionStatus,
  isCurrentUser = false,
}: TaskAssigneeCellProps) {
  if (!assigneeName) {
    return (
      <Badge variant="outline" className="border-dashed">
        <CircleDashed aria-hidden="true" />
        Chưa giao
      </Badge>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <UserRound className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate" title={assigneeName}>
          {isCurrentUser ? `${assigneeName} (bạn)` : assigneeName}
        </span>
      </span>
      {assignedAt && (
        <span className="text-muted-foreground text-xs">
          Giao {formatOperationalDateTime(assignedAt)}
        </span>
      )}
      {executionStatus && executionStatus !== 'Queued' && (
        <Badge
          variant={executionStatus === 'InProgress' ? 'default' : 'secondary'}
          className="w-fit"
        >
          {EXECUTION_LABELS[executionStatus]}
        </Badge>
      )}
    </div>
  )
}
