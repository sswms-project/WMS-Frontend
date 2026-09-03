export const NOTIFICATION_TYPES = [
  'LowStock',
  'TaskAssigned',
  'DeliveryUpdate',
  'POUpdate',
  'TenantStatusUpdate',
  'SubscriptionPlanUpdate',
  'SubscriptionPaymentUpdate',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface NotificationQuery {
  readonly search?: string
  readonly isRead?: boolean
  readonly type?: NotificationType
  readonly dateFrom?: string
  readonly dateTo?: string
  readonly pageNumber: number
  readonly pageSize: number
}

export interface NotificationItem {
  readonly id: string
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly isRead: boolean
  readonly referenceType: string | null
  readonly referenceId: string | null
  readonly createdAt: string
}

export interface NotificationListResponse {
  readonly items: NotificationItem[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
}

export interface AuditLogQuery {
  readonly search?: string
  readonly action?: string
  readonly entityType?: string
  readonly entityId?: string
  readonly userId?: string
  readonly dateFrom?: string
  readonly dateTo?: string
  readonly pageNumber: number
  readonly pageSize: number
}

export interface AuditLogItem {
  readonly id: string
  readonly tenantId: string | null
  readonly userId: string
  readonly actorName: string
  readonly actorEmail: string
  readonly action: string
  readonly entityType: string
  readonly entityId: string
  readonly description: string
  readonly reason: string | null
  readonly oldValue: string | null
  readonly newValue: string | null
  readonly createdAt: string
}

export interface AuditLogListResponse {
  readonly items: AuditLogItem[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
}

export interface NotificationCreatedEvent {
  readonly notificationId: string
  readonly type: NotificationType
  readonly createdAt: string
}
