import { Badge } from '@/components/ui/badge'
import { getStaffStatusLabel } from '../../utils/staff-status'

interface StaffStatusBadgeProps {
  readonly status: string
}

export function StaffStatusBadge({ status }: StaffStatusBadgeProps) {
  const variant = status === 'Inactive' || status === 'Locked' ? 'destructive' : 'outline'
  return <Badge variant={variant}>{getStaffStatusLabel(status)}</Badge>
}
