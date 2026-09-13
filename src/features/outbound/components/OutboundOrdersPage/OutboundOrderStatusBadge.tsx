import { Badge } from '@/components/ui/badge'
import type { OutboundOrderStatus } from '../../types/outbound.types'
import { OUTBOUND_ORDER_STATUS_LABELS } from '../../utils/outbound-format'

export function OutboundOrderStatusBadge({ status }: { readonly status: OutboundOrderStatus }) {
  const variant =
    status === 'Failed'
      ? 'destructive'
      : status === 'Pending'
        ? 'outline'
        : status === 'Delivered'
          ? 'default'
          : 'secondary'

  return <Badge variant={variant}>{OUTBOUND_ORDER_STATUS_LABELS[status]}</Badge>
}
