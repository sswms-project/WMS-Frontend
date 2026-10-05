import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  INBOUND_REQUEST_STATUS,
  type InboundRequestStatus,
  type InboundRequestStatusCount,
} from '../../types/inbound-request.types'

const STATUS_GROUPS: {
  readonly label: string
  readonly description: string
  readonly statuses: readonly InboundRequestStatus[]
}[] = [
  {
    label: 'Bản nháp',
    description: 'Đơn chưa gửi duyệt',
    statuses: [INBOUND_REQUEST_STATUS.Draft],
  },
  {
    label: 'Chờ duyệt',
    description: 'Đang chờ phê duyệt',
    statuses: [INBOUND_REQUEST_STATUS.PendingApproval],
  },
  {
    label: 'Đang xử lý',
    description: 'Đã duyệt · Đã gửi · Đã xác nhận · Nhận một phần',
    statuses: [
      INBOUND_REQUEST_STATUS.Approved,
      INBOUND_REQUEST_STATUS.Sent,
      INBOUND_REQUEST_STATUS.Confirmed,
      INBOUND_REQUEST_STATUS.PartiallyReceived,
    ],
  },
  {
    label: 'Đã nhận đủ',
    description: 'Hoàn tất nhận hàng',
    statuses: [INBOUND_REQUEST_STATUS.Received],
  },
  {
    label: 'Từ chối / hủy',
    description: 'Bị từ chối · Đã hủy',
    statuses: [INBOUND_REQUEST_STATUS.Rejected, INBOUND_REQUEST_STATUS.Cancelled],
  },
]

interface InboundRequestStatusStatsProps {
  readonly counts: readonly InboundRequestStatusCount[]
  readonly isLoading: boolean
  readonly isError: boolean
}

export function InboundRequestStatusStats({
  counts,
  isLoading,
  isError,
}: InboundRequestStatusStatsProps) {
  const countByStatus = new Map(counts.map(({ status, count }) => [status, count]))

  return (
    <section
      className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Thống kê yêu cầu nhập kho theo trạng thái"
      aria-busy={isLoading}
    >
      {STATUS_GROUPS.map((group) => (
        <Card key={group.label} size="sm" className="border-l-primary border-l-2">
          <CardContent className="flex min-h-12 items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{group.label}</p>
              <p className="text-muted-foreground line-clamp-2 text-[10px] leading-tight">
                {group.description}
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-10 shrink-0" aria-hidden="true" />
            ) : (
              <p className="text-primary shrink-0 text-2xl font-semibold tabular-nums">
                {isError
                  ? '—'
                  : group.statuses.reduce(
                      (total, status) => total + (countByStatus.get(status) ?? 0),
                      0
                    )}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
