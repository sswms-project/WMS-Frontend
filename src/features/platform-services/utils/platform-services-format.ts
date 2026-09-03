import { APP_ROUTES } from '@/routes/app-routes'

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPlatformDateTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Không xác định' : dateTimeFormatter.format(date)
}

export function getNotificationReferenceRoute(
  referenceType: string | null,
  referenceId: string | null
): string | null {
  if (!referenceType || !referenceId) return null

  const route = notificationReferenceRoutes[referenceType]
  return route ? route(referenceId) : null
}

export function formatAuditValue(value: string | null): string {
  if (!value) return 'Không có dữ liệu'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const notificationReferenceRoutes: Record<string, (id: string) => string> = {
  PurchaseOrder: APP_ROUTES.purchaseOrderDetail,
  Tenant: () => APP_ROUTES.organization,
  SubscriptionPlan: () => APP_ROUTES.subscription,
  Payment: () => APP_ROUTES.subscriptionPayments,
}
