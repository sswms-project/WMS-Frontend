import {
  CheckCircle2,
  FilePen,
  Hourglass,
  PackageOpen,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  INBOUND_REQUEST_STATUS,
  type InboundRequestStatus,
  type InboundRequestStatusCount,
} from '../../types/inbound-request.types'

const STATUS_GROUPS: {
  readonly label: string
  readonly description: string
  readonly icon: LucideIcon
  readonly tone: 'default' | 'active' | 'warning' | 'danger'
  readonly statuses: readonly InboundRequestStatus[]
}[] = [
  {
    label: 'Bản nháp',
    description: 'Đơn chưa gửi duyệt',
    icon: FilePen,
    tone: 'default',
    statuses: [INBOUND_REQUEST_STATUS.Draft],
  },
  {
    label: 'Chờ duyệt',
    description: 'Đang chờ phê duyệt',
    icon: Hourglass,
    tone: 'warning',
    statuses: [INBOUND_REQUEST_STATUS.PendingApproval],
  },
  {
    label: 'Đang xử lý',
    description: 'Đã duyệt · Đã gửi · Đã xác nhận · Nhận một phần',
    icon: PackageOpen,
    tone: 'active',
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
    icon: CheckCircle2,
    tone: 'default',
    statuses: [INBOUND_REQUEST_STATUS.Received],
  },
  {
    label: 'Từ chối / hủy',
    description: 'Bị từ chối · Đã hủy',
    icon: XCircle,
    tone: 'danger',
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
      className="bg-border grid shrink-0 grid-cols-2 gap-px border sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Thống kê yêu cầu nhập kho theo trạng thái"
      aria-busy={isLoading}
    >
      {STATUS_GROUPS.map((group, index) => {
        const total = group.statuses.reduce(
          (sum, status) => sum + (countByStatus.get(status) ?? 0),
          0
        )
        // Màu nhấn chỉ bật khi nhóm có đơn, để số 0 không gây báo động giả.
        const lit = !isLoading && !isError && total > 0
        const Icon = group.icon
        return (
          <div
            key={group.label}
            style={{ animationDelay: `${index * 50}ms` }}
            className="bg-card motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 fill-mode-backwards animation-duration-300 flex items-center gap-3 px-4 py-3"
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center',
                lit && group.tone === 'danger'
                  ? 'bg-destructive/10 text-destructive'
                  : lit && group.tone === 'warning'
                    ? 'bg-warning-container text-on-warning-container'
                    : lit && group.tone === 'active'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{group.label}</p>
              <p
                className="text-muted-foreground line-clamp-1 text-[11px]"
                title={group.description}
              >
                {group.description}
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-10 shrink-0" aria-hidden="true" />
            ) : (
              <p className="shrink-0 text-2xl font-semibold tabular-nums">
                {isError ? '—' : total.toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        )
      })}
    </section>
  )
}
