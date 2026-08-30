import type { PurchaseOrderStatus } from '../types/purchase-order.types'

const OPERATIONAL_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const OPERATIONAL_DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeZone: OPERATIONAL_TIME_ZONE,
})
const OPERATIONAL_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: OPERATIONAL_TIME_ZONE,
})
const DATE_INPUT_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: OPERATIONAL_TIME_ZONE,
})

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  Draft: 'Bản nháp',
  PendingApproval: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Bị từ chối',
  Sent: 'Đã gửi nhà cung cấp',
  Confirmed: 'Nhà cung cấp xác nhận',
  PartiallyReceived: 'Nhận một phần',
  Received: 'Đã nhận đủ',
  Cancelled: 'Đã hủy',
}

function parseOperationalDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toOperationalDateInputValue(value: string | null | undefined): string {
  const date = parseOperationalDate(value)
  if (!date) return ''

  const parts = DATE_INPUT_PARTS_FORMATTER.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return year && month && day ? `${year}-${month}-${day}` : ''
}

export function toOperationalDateApiValue(value: string): string | null {
  return value ? `${value}T00:00:00.000Z` : null
}

export function formatOperationalDate(value: string | null | undefined): string {
  if (!value) return 'Chưa xác định'

  const date = parseOperationalDate(value)
  return date ? OPERATIONAL_DATE_FORMATTER.format(date) : 'Không xác định'
}

export function formatOperationalDateTime(value: string | null | undefined): string {
  const date = parseOperationalDate(value)
  return date ? OPERATIONAL_DATE_TIME_FORMATTER.format(date) : 'Không xác định'
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)
}

export function formatCurrency(value: number | null) {
  if (value === null) return 'Chưa nhập'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
