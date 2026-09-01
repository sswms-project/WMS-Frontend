import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaginationControls } from '../shared/PaginationControls'
import { NotificationFilters } from './NotificationFilters'
import { NotificationList } from './NotificationList'
import type { NotificationDirectoryProps } from './types'

export function NotificationDirectory(props: NotificationDirectoryProps) {
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
          disabled={props.unreadCount === 0 || props.isMarkingAll}
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
          <NotificationList
            items={props.items}
            isLoading={props.isLoading}
            isFetching={props.isFetching}
            isError={props.isError}
            hasActiveFilters={props.hasActiveFilters}
            pendingNotificationId={props.pendingNotificationId}
            onMarkRead={props.onMarkRead}
            onRetry={props.onRetry}
          />
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
