import type { SupplierStatus } from '../types/supplier.types'

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  Active: 'Đang hợp tác',
  Inactive: 'Ngừng hợp tác',
}

export const SUPPLIER_STATUS_OPTIONS: ReadonlyArray<{
  readonly value: SupplierStatus
  readonly label: string
}> = [
  { value: 'Active', label: SUPPLIER_STATUS_LABELS.Active },
  { value: 'Inactive', label: SUPPLIER_STATUS_LABELS.Inactive },
]

export function formatSupplierDateTime(value: string | null) {
  if (!value) return 'Chưa cập nhật'

  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  )
}

export function formatSupplierText(value: string | null) {
  return value && value.trim().length > 0 ? value : 'Chưa cập nhật'
}
