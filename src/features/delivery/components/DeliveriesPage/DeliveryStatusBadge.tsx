import { Badge } from '@/components/ui/badge'
import type { DeliveryStatus } from '../../types/delivery.types'
import { DELIVERY_STATUS_LABELS } from '../../utils/delivery-format'

export function DeliveryStatusBadge({ status }: { readonly status: DeliveryStatus }) {
  const variant =
    status === 'Failed'
      ? 'destructive'
      : status === 'Pending'
        ? 'outline'
        : status === 'Delivered'
          ? 'default'
          : 'secondary'

  return <Badge variant={variant}>{DELIVERY_STATUS_LABELS[status]}</Badge>
}
