'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { NotificationBell } from '@/components/NotificationBell'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../hooks/use-platform-services'
import type { NotificationItem } from '../types/platform-services.types'

const HEADER_PAGE_SIZE = 5

export function NotificationHeaderController() {
  const recentQuery = useNotificationsQuery({ pageNumber: 1, pageSize: HEADER_PAGE_SIZE })
  const unreadQuery = useNotificationsQuery({ pageNumber: 1, pageSize: 1, isRead: false })
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllMutation = useMarkAllNotificationsReadMutation()
  const [pendingNotificationId, setPendingNotificationId] = useState<string | null>(null)

  function markRead(notification: NotificationItem) {
    if (notification.isRead) return
    setPendingNotificationId(notification.id)
    markReadMutation.mutate(notification.id, {
      onSettled: () => setPendingNotificationId(null),
    })
  }

  function markAllRead() {
    markAllMutation.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả thông báo đã đọc.'),
    })
  }

  return (
    <NotificationBell
      notifications={recentQuery.data?.items ?? []}
      unreadCount={unreadQuery.data?.totalCount ?? 0}
      isLoading={recentQuery.isLoading || unreadQuery.isLoading}
      isError={recentQuery.isError || unreadQuery.isError}
      pendingNotificationId={pendingNotificationId}
      isMarkingAll={markAllMutation.isPending}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      onRetry={() => {
        void recentQuery.refetch()
        void unreadQuery.refetch()
      }}
    />
  )
}
