import { Badge } from '@/components/ui/badge'
import type { StockIssueRequestStatus } from '../../types/stock-issue.types'
import { STOCK_ISSUE_REQUEST_STATUS_LABELS } from '../../utils/stock-issue-format'

export function StockIssueRequestStatusBadge({
  status,
}: {
  readonly status: StockIssueRequestStatus
}) {
  const variant =
    status === 'Cancelled'
      ? 'destructive'
      : status === 'Pending'
        ? 'outline'
        : status === 'Dispatched'
          ? 'default'
          : 'secondary'

  return <Badge variant={variant}>{STOCK_ISSUE_REQUEST_STATUS_LABELS[status]}</Badge>
}
