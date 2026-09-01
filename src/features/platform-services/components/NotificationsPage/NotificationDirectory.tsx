import { Bell, CheckCheck, ExternalLink, RefreshCw, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { NotificationItem, NotificationType } from '../../types/platform-services.types'
import {
  formatPlatformDateTime,
  getNotificationReferenceRoute,
} from '../../utils/platform-services-format'
import { PaginationControls } from '../shared/PaginationControls'

export interface NotificationFilterValues {
  readonly search: string
  readonly type: string
  readonly readState: string
  readonly dateFrom: string
  readonly dateTo: string
}

interface NotificationDirectoryProps {
  readonly items: NotificationItem[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly filters: NotificationFilterValues
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly hasActiveFilters: boolean
  readonly pendingNotificationId: string | null
  readonly isMarkingAll: boolean
  readonly onApplyFilters: (filters: NotificationFilterValues) => void
  readonly onClearFilters: () => void
  readonly onPageChange: (page: number) => void
  readonly onMarkRead: (notification: NotificationItem) => void
  readonly onMarkAllRead: () => void
  readonly onRetry: () => void
}

const TYPE_LABELS: Record<NotificationType, string> = {
  LowStock: 'Tồn kho thấp',
  TaskAssigned: 'Nhiệm vụ',
  DeliveryUpdate: 'Giao hàng',
  POUpdate: 'Đơn mua',
}

export function NotificationDirectory(props: NotificationDirectoryProps) {
  const unreadCount = props.items.filter((item) => !item.isRead).length
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3" aria-labelledby="notifications-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="notifications-title" className="text-xl font-semibold">
            Thông báo
          </h2>
          <p className="text-muted-foreground text-sm">
            Theo dõi các sự kiện liên quan đến tài khoản của bạn.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={unreadCount === 0 || props.isMarkingAll}
          onClick={props.onMarkAllRead}
        >
          <CheckCheck data-icon="inline-start" aria-hidden="true" />
          {props.isMarkingAll ? 'Đang xử lý…' : 'Đánh dấu tất cả đã đọc'}
        </Button>
      </div>

      <NotificationFilters
        filters={props.filters}
        onApply={props.onApplyFilters}
        onClear={props.onClearFilters}
      />

      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Danh sách thông báo</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
          {props.isLoading ? <NotificationLoadingState /> : null}
          {props.isError ? <NotificationErrorState onRetry={props.onRetry} /> : null}
          {!props.isLoading && !props.isError && props.items.length === 0 ? (
            <NotificationEmptyState hasActiveFilters={props.hasActiveFilters} />
          ) : null}
          {!props.isLoading && !props.isError && props.items.length > 0 ? (
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
          ) : null}
        </CardContent>
        {!props.isLoading && !props.isError && props.totalCount > 0 ? (
          <PaginationControls
            page={props.page}
            pageSize={props.pageSize}
            totalCount={props.totalCount}
            isFetching={props.isFetching}
            onPageChange={props.onPageChange}
          />
        ) : null}
      </Card>
    </section>
  )
}

function NotificationFilters({
  filters,
  onApply,
  onClear,
}: {
  readonly filters: NotificationFilterValues
  readonly onApply: (filters: NotificationFilterValues) => void
  readonly onClear: () => void
}) {
  return (
    <form
      key={JSON.stringify(filters)}
      className="bg-card grid gap-3 rounded-md border p-3 sm:grid-cols-2 xl:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onApply({
          search: String(data.get('search') ?? ''),
          type: String(data.get('type') ?? ''),
          readState: String(data.get('readState') ?? 'all'),
          dateFrom: String(data.get('dateFrom') ?? ''),
          dateTo: String(data.get('dateTo') ?? ''),
        })
      }}
    >
      <div className="space-y-1 sm:col-span-2 xl:col-span-2">
        <Label htmlFor="notification-search">Tìm kiếm</Label>
        <Input
          id="notification-search"
          name="search"
          defaultValue={filters.search}
          placeholder="Ví dụ: giao hàng thất bại…"
          autoComplete="off"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-type">Loại</Label>
        <Select name="type" defaultValue={filters.type || 'all'}>
          <SelectTrigger id="notification-type" className="w-full">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-read-state">Trạng thái</Label>
        <Select name="readState" defaultValue={filters.readState}>
          <SelectTrigger id="notification-read-state" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unread">Chưa đọc</SelectItem>
            <SelectItem value="read">Đã đọc</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-from">Từ ngày</Label>
        <Input id="notification-from" name="dateFrom" type="date" defaultValue={filters.dateFrom} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-to">Đến ngày</Label>
        <Input id="notification-to" name="dateTo" type="date" defaultValue={filters.dateTo} />
      </div>
      <div className="flex gap-2 sm:col-span-2 xl:col-span-6">
        <Button type="submit">
          <Search data-icon="inline-start" aria-hidden="true" />
          Áp dụng
        </Button>
        <Button type="button" variant="ghost" onClick={onClear}>
          Xóa lọc
        </Button>
      </div>
    </form>
  )
}

function NotificationRow({
  notification,
  isPending,
  onMarkRead,
}: {
  readonly notification: NotificationItem
  readonly isPending: boolean
  readonly onMarkRead: (notification: NotificationItem) => void
}) {
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
              <a href={referenceRoute}>
                <ExternalLink data-icon="inline-start" aria-hidden="true" />
                Mở liên quan
              </a>
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
