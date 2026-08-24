import { Badge } from '@/components/ui/badge'
import type { InboundReceiptStatus } from '../../types/inbound.types'
import { INBOUND_STATUS_LABELS } from '../../utils/inbound-format'

export function InboundStatusBadge({ status }: { readonly status: InboundReceiptStatus }) {
  const variant =
    status === 'Rejected'
      ? 'destructive'
      : status === 'Draft'
        ? 'outline'
        : status === 'PendingApproval'
          ? 'secondary'
          : 'default'
  return <Badge variant={variant}>{INBOUND_STATUS_LABELS[status]}</Badge>
}
