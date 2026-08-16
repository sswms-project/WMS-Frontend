import { Ban, CheckCircle2, Clock3, TimerOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { INVITATION_STATUSES, type InvitationStatus } from '../../types/invitation.types'

interface InvitationStatusBadgeProps {
  readonly status: InvitationStatus
}

const statusConfig = {
  [INVITATION_STATUSES.pending]: {
    label: 'Đang chờ',
    variant: 'secondary' as const,
    icon: Clock3,
  },
  [INVITATION_STATUSES.accepted]: {
    label: 'Đã chấp nhận',
    variant: 'default' as const,
    icon: CheckCircle2,
  },
  [INVITATION_STATUSES.expired]: {
    label: 'Hết hạn',
    variant: 'outline' as const,
    icon: TimerOff,
  },
  [INVITATION_STATUSES.revoked]: {
    label: 'Đã thu hồi',
    variant: 'destructive' as const,
    icon: Ban,
  },
}

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Badge variant={config.variant}>
      <StatusIcon aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
