import type { PurchaseOrderStatus } from '../types/purchase-order.types'

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

export function formatOperationalDate(value: string | null) {
  if (!value) return 'Chưa xác định'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))
}

export function formatOperationalDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
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
