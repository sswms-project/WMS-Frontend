import type {
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
} from '../types/subscription.types'

export const NEAR_EXPIRY_DAYS = 7

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(value: string | null): string {
  if (!value) return 'Chưa ghi nhận'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không hợp lệ'
  return dateFormatter.format(date)
}

export function formatBillingCycle(value: string): string {
  const normalizedValue = value.toLowerCase()
  if (normalizedValue === 'monthly') return 'Hàng tháng'
  if (normalizedValue === 'yearly') return 'Hàng năm'
  return value || 'Không xác định'
}

export function formatSubscriptionStatus(value: string): string {
  const normalizedValue = value.toLowerCase()
  if (normalizedValue === 'active') return 'Đang hoạt động'
  if (normalizedValue === 'expired') return 'Đã hết hạn'
  if (normalizedValue === 'cancelled' || normalizedValue === 'canceled') return 'Đã hủy'
  return value || 'Không xác định'
}

export function formatPaymentStatus(value: string): string {
  const normalizedValue = value.toLowerCase()
  if (normalizedValue === 'completed') return 'Đã thanh toán'
  if (normalizedValue === 'pending') return 'Đang xử lý'
  if (normalizedValue === 'failed') return 'Thất bại'
  return value || 'Không xác định'
}

export function isCompletedPayment(status: string): boolean {
  return status.toLowerCase() === 'completed'
}

export function formatHistoricalPlanName(planName: string | null): string {
  return planName?.trim() || 'Không xác định'
}

export function formatInvoiceSnapshotValue(value: string | null): string {
  return value?.trim() || 'Không có dữ liệu lịch sử'
}

export function isActivePlan(plan: SubscriptionPlanResponse): boolean {
  return plan.status.toLowerCase() === 'active'
}

export function isCancelledSubscription(subscription?: SubscriptionStatusResponse): boolean {
  if (!subscription) return false
  const normalizedStatus = subscription.status.toLowerCase()
  return normalizedStatus === 'cancelled' || normalizedStatus === 'canceled'
}

export function shouldShowRenewAction(subscription?: SubscriptionStatusResponse): boolean {
  if (!subscription || isCancelledSubscription(subscription)) return false
  return subscription.isExpired || subscription.daysRemaining <= NEAR_EXPIRY_DAYS
}

export function findCurrentPlan(
  subscription: SubscriptionStatusResponse | undefined,
  plans: readonly SubscriptionPlanResponse[]
): SubscriptionPlanResponse | undefined {
  if (!subscription) return undefined
  return plans.find((plan) => plan.planName === subscription.planName)
}

export function buildInvoiceFileName(invoiceNumber: string): string {
  const normalizedInvoiceNumber = invoiceNumber.trim()
  return `${normalizedInvoiceNumber || 'invoice'}.pdf`
}

export function getFeatureRows(plan?: SubscriptionPlanResponse) {
  if (!plan) return []

  return plan.features.map((feature) => ({
    label: feature.displayName,
    value: feature.featureType === 'Limit' ? `${feature.limitValue ?? '—'}` : 'Có',
  }))
}
