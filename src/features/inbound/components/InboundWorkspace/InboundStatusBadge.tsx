import { Badge } from '@/components/ui/badge'
import type { GoodsReceiptStatus } from '../../types/inbound.types'
import { INBOUND_STATUS_LABELS } from '../../utils/inbound-format'

export function InboundStatusBadge({ status }: { readonly status: GoodsReceiptStatus }) {
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
