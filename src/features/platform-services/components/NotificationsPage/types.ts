import type { NotificationItem } from '../../types/platform-services.types'

export interface NotificationFilterValues {
  readonly search: string
  readonly type: string
  readonly readState: string
  readonly dateFrom: string
  readonly dateTo: string
}

export interface NotificationDirectoryProps {
  readonly items: NotificationItem[]
  readonly totalCount: number
  readonly unreadCount: number | null
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
