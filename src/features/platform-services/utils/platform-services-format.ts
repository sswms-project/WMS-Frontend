import { APP_ROUTES } from '@/routes/app-routes'
import type { NotificationItem } from '../types/platform-services.types'

const TZ = 'Asia/Ho_Chi_Minh'

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const vnDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TZ })
const vnTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TZ,
})

export function getNotificationDateGroup(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Cũ hơn'
  const now = new Date()
  const dateStr = vnDateFormatter.format(date)
  const today = vnDateFormatter.format(now)
  const yesterday = vnDateFormatter.format(new Date(now.getTime() - 86_400_000))
  const weekAgo = vnDateFormatter.format(new Date(now.getTime() - 6 * 86_400_000))
  if (dateStr === today) return 'Hôm nay'
  if (dateStr === yesterday) return 'Hôm qua'
  if (dateStr >= weekAgo) return 'Tuần này'
  return 'Cũ hơn'
}

export function formatNotificationTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : vnTimeFormatter.format(date)
}

export function formatPlatformDateTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Không xác định' : dateTimeFormatter.format(date)
}

export function getNotificationReferenceRoute(
  notification: Pick<NotificationItem, 'type' | 'referenceType' | 'referenceId'>
): string | null {
  const { type, referenceType, referenceId } = notification
  if (!referenceType || !referenceId) return null

  if (referenceType === 'StockIssueRequest') {
    if (type === 'StockIssueRequestUpdate' || type === 'TaskAssigned')
      return APP_ROUTES.stockIssueRequests
  }

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
  InboundRequest: APP_ROUTES.inboundRequestDetail,
  GoodsReceipt: APP_ROUTES.goodsReceiptDetail,
  StockAdjustment: APP_ROUTES.stockAdjustmentDetail,
  CycleCount: APP_ROUTES.cycleCountDetail,
  Warehouse: APP_ROUTES.warehouseDetail,
  Product: APP_ROUTES.productDetail,
  StockTransfer: () => APP_ROUTES.transfers,
  GoodsReturnRequest: () => APP_ROUTES.goodsReturnRequests,
  Tenant: () => APP_ROUTES.organization,
  SubscriptionPlan: () => APP_ROUTES.subscription,
  Payment: () => APP_ROUTES.subscriptionPayments,
}
