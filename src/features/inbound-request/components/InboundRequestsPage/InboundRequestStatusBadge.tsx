import { Badge } from '@/components/ui/badge'
import {
  INBOUND_REQUEST_STATUS,
  type InboundRequestStatus,
} from '../../types/inbound-request.types'
import { INBOUND_REQUEST_STATUS_LABELS } from '../../utils/inbound-request-format'

export function InboundRequestStatusBadge({ status }: { readonly status: InboundRequestStatus }) {
  const variant =
    status === INBOUND_REQUEST_STATUS.Cancelled || status === INBOUND_REQUEST_STATUS.Rejected
      ? 'destructive'
      : status === INBOUND_REQUEST_STATUS.Draft
        ? 'outline'
        : status === INBOUND_REQUEST_STATUS.PendingApproval ||
            status === INBOUND_REQUEST_STATUS.PartiallyReceived ||
            status === INBOUND_REQUEST_STATUS.Sent
          ? 'secondary'
          : 'default'

  return <Badge variant={variant}>{INBOUND_REQUEST_STATUS_LABELS[status]}</Badge>
}
