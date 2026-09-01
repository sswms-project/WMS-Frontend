'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  NotificationDirectory,
  type NotificationFilterValues,
} from '../components/NotificationsPage'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../hooks/use-platform-services'
import { notificationFiltersSchema } from '../schemas/platform-services.schema'
import type { NotificationItem } from '../types/platform-services.types'
import { buildNotificationQuery } from '../utils/platform-services-query'

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const serializedParams = searchParams.toString()
  const params = useMemo(() => new URLSearchParams(serializedParams), [serializedParams])
  const queryParams = useMemo(() => buildNotificationQuery(params), [params])
  const notificationsQuery = useNotificationsQuery(queryParams)
  const unreadQuery = useNotificationsQuery({ pageNumber: 1, pageSize: 1, isRead: false })
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllMutation = useMarkAllNotificationsReadMutation()
  const [pendingNotificationId, setPendingNotificationId] = useState<string | null>(null)

  const filters: NotificationFilterValues = {
    search: params.get('search') ?? '',
    type: queryParams.type ?? '',
    readState:
      queryParams.isRead === true ? 'read' : queryParams.isRead === false ? 'unread' : 'all',
    dateFrom: params.get('dateFrom') ?? '',
    dateTo: params.get('dateTo') ?? '',
  }
  const hasActiveFilters = ['search', 'type', 'readState', 'dateFrom', 'dateTo'].some((key) => {
    const value = params.get(key)
    return value !== null && value !== '' && value !== 'all'
  })

  function applyFilters(values: NotificationFilterValues) {
    const result = notificationFiltersSchema.safeParse(values)
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Bộ lọc không hợp lệ.')
      return
    }

    const next = new URLSearchParams()
    setIfPresent(next, 'search', result.data.search)
    setIfPresent(next, 'type', result.data.type === 'all' ? '' : result.data.type)
    setIfPresent(next, 'readState', result.data.readState === 'all' ? '' : result.data.readState)
    setIfPresent(next, 'dateFrom', result.data.dateFrom)
    setIfPresent(next, 'dateTo', result.data.dateTo)
    navigate(next)
  }

  function markRead(notification: NotificationItem) {
    if (notification.isRead) return
    setPendingNotificationId(notification.id)
    markReadMutation.mutate(notification.id, {
      onSettled: () => setPendingNotificationId(null),
    })
  }

  function markAllRead() {
    markAllMutation.mutate(undefined, {
      onSuccess: (updatedCount) => {
        toast.success(
          updatedCount > 0
            ? `Đã đánh dấu ${updatedCount} thông báo đã đọc.`
            : 'Không còn thông báo chưa đọc.'
        )
      },
    })
  }

  return (
    <NotificationDirectory
      items={notificationsQuery.data?.items ?? []}
      totalCount={notificationsQuery.data?.totalCount ?? 0}
      unreadCount={unreadQuery.data?.totalCount ?? null}
      page={queryParams.pageNumber}
      pageSize={queryParams.pageSize}
      filters={filters}
      isLoading={notificationsQuery.isLoading}
      isFetching={notificationsQuery.isFetching}
      isError={notificationsQuery.isError}
      hasActiveFilters={hasActiveFilters}
      pendingNotificationId={pendingNotificationId}
      isMarkingAll={markAllMutation.isPending}
      onApplyFilters={applyFilters}
      onClearFilters={() => navigate(new URLSearchParams())}
      onPageChange={(page) => {
        const next = new URLSearchParams(params)
        next.set('page', String(page))
        navigate(next)
      }}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      onRetry={() => void notificationsQuery.refetch()}
    />
  )
}

function setIfPresent(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value)
}

function navigate(params: URLSearchParams) {
  const query = params.toString()
  window.history.pushState(
    null,
    '',
    query ? `${APP_ROUTES.notifications}?${query}` : APP_ROUTES.notifications
  )
}
