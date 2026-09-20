import { APP_ROUTES } from '@/routes/app-routes'
import type { NotificationItem } from '../types/platform-services.types'

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
