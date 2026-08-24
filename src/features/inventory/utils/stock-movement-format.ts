import { STOCK_MOVEMENT_TYPES } from '../types/inventory.types'

const movementLabels: Record<string, string> = {
  [STOCK_MOVEMENT_TYPES.inbound]: 'Nhập kho',
  [STOCK_MOVEMENT_TYPES.outbound]: 'Xuất kho',
  [STOCK_MOVEMENT_TYPES.transfer]: 'Chuyển kho',
  [STOCK_MOVEMENT_TYPES.adjustment]: 'Điều chỉnh',
  [STOCK_MOVEMENT_TYPES.return]: 'Trả hàng',
}

export function formatStockMovementType(value: string): string {
  return movementLabels[value] ?? (value || 'Không xác định')
}

export function formatStockMovementQuantity(value: number): string {
  const formatted = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
  return value > 0 ? `+${formatted}` : formatted
}

export function formatReferenceId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value
}
