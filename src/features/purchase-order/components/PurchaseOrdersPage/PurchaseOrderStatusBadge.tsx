import { Badge } from '@/components/ui/badge'
import type { PurchaseOrderStatus } from '../../types/purchase-order.types'
import { PURCHASE_ORDER_STATUS_LABELS } from '../../utils/purchase-order-format'

export function PurchaseOrderStatusBadge({ status }: { readonly status: PurchaseOrderStatus }) {
  const variant =
    status === 'Cancelled' || status === 'Rejected'
      ? 'destructive'
      : status === 'Draft'
        ? 'outline'
        : status === 'PendingApproval' || status === 'PartiallyReceived' || status === 'Sent'
          ? 'secondary'
          : 'default'

  return <Badge variant={variant}>{PURCHASE_ORDER_STATUS_LABELS[status]}</Badge>
}
