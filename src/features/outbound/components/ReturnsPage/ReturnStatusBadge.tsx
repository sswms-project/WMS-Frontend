import { Badge } from '@/components/ui/badge'
import type { ReturnStatus } from '../../types/outbound.types'
import { RETURN_STATUS_LABELS } from '../../utils/outbound-format'

export function ReturnStatusBadge({ status }: { readonly status: ReturnStatus }) {
  const variant =
    status === 'Rejected'
      ? 'destructive'
      : status === 'Requested'
        ? 'outline'
        : status === 'Restocked'
          ? 'default'
          : 'secondary'

  return <Badge variant={variant}>{RETURN_STATUS_LABELS[status]}</Badge>
}
