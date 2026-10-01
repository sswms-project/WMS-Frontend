'use client'

import { toast } from 'sonner'
import { NotificationBell } from '@/components/NotificationBell'
import { useOpenNotification } from '../hooks/use-open-notification'
import {
  useInfiniteNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
} from '../hooks/use-platform-services'

const HEADER_PAGE_SIZE = 10

export function NotificationHeaderController() {
  const recentQuery = useInfiniteNotificationsQuery(HEADER_PAGE_SIZE)
  const unreadQuery = useNotificationsQuery({ pageNumber: 1, pageSize: 1, isRead: false })
  const markAllMutation = useMarkAllNotificationsReadMutation()
  const { pendingNotificationId, open } = useOpenNotification()

  function markAllRead() {
    markAllMutation.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả thông báo đã đọc.'),
    })
  }

  return (
    <NotificationBell
      notifications={recentQuery.data?.pages.flatMap((page) => page.items) ?? []}
      hasMore={recentQuery.hasNextPage}
      isLoadingMore={recentQuery.isFetchingNextPage}
      onLoadMore={() => void recentQuery.fetchNextPage()}
      unreadCount={unreadQuery.data?.totalCount ?? 0}
      isLoading={recentQuery.isLoading || unreadQuery.isLoading}
      isError={recentQuery.isError || unreadQuery.isError}
      pendingNotificationId={pendingNotificationId}
      isMarkingAll={markAllMutation.isPending}
      onMarkRead={open}
      onMarkAllRead={markAllRead}
      onRetry={() => {
        void recentQuery.refetch()
        void unreadQuery.refetch()
      }}
    />
  )
}
