import { CheckCheck } from 'lucide-react'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { NotificationFilters } from './NotificationFilters'
import { NotificationList } from './NotificationList'
import type { NotificationDirectoryProps } from './types'

export function NotificationDirectory(props: NotificationDirectoryProps) {
  return (
    <section
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3"
      aria-labelledby="notifications-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="notifications-title" className="text-xl font-semibold">
            Thông báo
          </h2>
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
      <OperationalListPanel aria-label="Danh sách thông báo">
        <div className="shrink-0 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Danh sách thông báo</h3>
        </div>
        <div data-slot="operational-list-body" className="min-h-0">
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
        </div>
        {!props.isLoading && !props.isError && props.totalCount > 0 ? (
          <OperationalPagination
            page={props.page}
            pageSize={props.pageSize}
            totalCount={props.totalCount}
            isPending={props.isFetching}
            onPageChange={props.onPageChange}
            onPageSizeChange={props.onPageSizeChange}
          />
        ) : null}
      </OperationalListPanel>
    </section>
  )
}
