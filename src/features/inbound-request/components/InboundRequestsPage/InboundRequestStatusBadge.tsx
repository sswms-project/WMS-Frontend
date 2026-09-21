import { Badge } from '@/components/ui/badge'
import type { InboundRequestStatus } from '../../types/inbound-request.types'
import { INBOUND_REQUEST_STATUS_LABELS } from '../../utils/inbound-request-format'

export function InboundRequestStatusBadge({ status }: { readonly status: InboundRequestStatus }) {
  const variant =
    status === 'Cancelled' || status === 'Rejected'
      ? 'destructive'
      : status === 'Draft'
        ? 'outline'
        : status === 'PendingApproval' || status === 'PartiallyReceived' || status === 'Sent'
          ? 'secondary'
          : 'default'

  return <Badge variant={variant}>{INBOUND_REQUEST_STATUS_LABELS[status]}</Badge>
}
