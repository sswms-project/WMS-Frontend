import { Badge } from '@/components/ui/badge'
import type { TransferStatus } from '../../types/transfer.types'
import { TRANSFER_STATUS_LABELS } from '../../utils/transfer-format'

export function TransferStatusBadge({ status }: { readonly status: TransferStatus }) {
  const variant =
    status === 'Cancelled'
      ? 'destructive'
      : status === 'Draft'
        ? 'outline'
        : status === 'InTransit'
          ? 'secondary'
          : 'default'

  return <Badge variant={variant}>{TRANSFER_STATUS_LABELS[status]}</Badge>
}
