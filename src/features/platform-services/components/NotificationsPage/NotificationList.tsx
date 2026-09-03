import Link from 'next/link'
import { Bell, ExternalLink, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '../../types/platform-services.types'
import {
  formatPlatformDateTime,
  getNotificationReferenceRoute,
} from '../../utils/platform-services-format'
import { TYPE_LABELS } from './NotificationFilters'

interface NotificationListProps {
  readonly items: NotificationItem[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly hasActiveFilters: boolean
  readonly pendingNotificationId: string | null
  readonly onMarkRead: (notification: NotificationItem) => void
  readonly onRetry: () => void
}

export function NotificationList(props: NotificationListProps) {
  if (props.isLoading) return <NotificationLoadingState />
  if (props.isError) return <NotificationErrorState onRetry={props.onRetry} />
  if (props.items.length === 0)
    return <NotificationEmptyState hasActiveFilters={props.hasActiveFilters} />
  return (
    <ul className="divide-y" aria-busy={props.isFetching}>
      {props.items.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          isPending={props.pendingNotificationId === notification.id}
          onMarkRead={props.onMarkRead}
        />
      ))}
    </ul>
  )
}

interface NotificationRowProps {
  readonly notification: NotificationItem
  readonly isPending: boolean
  readonly onMarkRead: (notification: NotificationItem) => void
}

function NotificationRow({ notification, isPending, onMarkRead }: NotificationRowProps) {
  const referenceRoute = getNotificationReferenceRoute(
    notification.referenceType,
    notification.referenceId
  )
  return (
    <li className={cn('flex gap-3 px-4 py-3', !notification.isRead && 'bg-muted/60')}>
      <span
        className={cn(
          'mt-1 size-2 shrink-0 rounded-full',
          notification.isRead ? 'bg-muted-foreground/30' : 'bg-primary'
        )}
        aria-label={notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
            {notification.title}
          </p>
          <Badge variant="outline">{TYPE_LABELS[notification.type]}</Badge>
        </div>
        <p className="text-muted-foreground text-sm break-words">{notification.message}</p>
        <p className="text-muted-foreground text-xs">
          {formatPlatformDateTime(notification.createdAt)}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {!notification.isRead ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => onMarkRead(notification)}
            >
              {isPending ? 'Đang lưu…' : 'Đánh dấu đã đọc'}
            </Button>
          ) : null}
          {referenceRoute ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={{ pathname: referenceRoute }}>
                <ExternalLink data-icon="inline-start" aria-hidden="true" />
                Mở liên quan
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function NotificationLoadingState() {
  return (
    <div className="space-y-3 p-4" role="status">
      <span className="sr-only">Đang tải thông báo</span>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  )
}

function NotificationErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center"
      role="alert"
    >
      <p>Không thể tải thông báo.</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
        Thử lại
      </Button>
    </div>
  )
}

function NotificationEmptyState({ hasActiveFilters }: { readonly hasActiveFilters: boolean }) {
  return (
    <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
      <Bell className="size-8" aria-hidden="true" />
      <p className="text-sm">
        {hasActiveFilters ? 'Không có thông báo phù hợp bộ lọc.' : 'Bạn chưa có thông báo nào.'}
      </p>
    </div>
  )
}
