import type { InventoryEligibilityStatus, QualityStatus } from '../types/inventory.types'

export function formatInventoryQuantity(value: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
}

export function formatQualityStatus(value: QualityStatus): string {
  return {
    Good: 'Tốt',
    Damaged: 'Hư hỏng',
    Quarantine: 'Cách ly',
  }[value]
}

export function formatEligibilityStatus(value: InventoryEligibilityStatus): string {
  return {
    Available: 'Khả dụng',
    ReceivingHold: 'Chờ hoàn tất nhập',
    InspectionHold: 'Chờ kiểm tra',
    DamageHold: 'Giữ do hư hỏng',
    Quarantine: 'Cách ly',
  }[value]
}

export function formatInventoryDate(value: string | null): string {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function formatInventoryDateOnly(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(date)
}
