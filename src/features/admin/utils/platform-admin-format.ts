const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function formatAdminDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

export function formatAdminDateTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date)
}

export function formatAdminCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatTenantStatus(status: TenantStatus): string {
  return TENANT_STATUS_LABELS[status]
}
import type { TenantStatus } from '../types/admin.types'

const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  Pending: 'Chờ kích hoạt',
  Active: 'Hoạt động',
  Inactive: 'Không hoạt động',
  Suspended: 'Tạm ngưng',
}

export function formatTenantStatusText(status: string): string {
  return TENANT_STATUS_LABELS[status as TenantStatus] ?? status
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  NewSubscription: 'Đăng ký mới',
  Renewal: 'Gia hạn',
  Upgrade: 'Nâng cấp',
  Downgrade: 'Hạ cấp',
  ScheduledChange: 'Đổi gói theo lịch',
}

export function formatPaymentType(type: string): string {
  return PAYMENT_TYPE_LABELS[type] ?? type
}
