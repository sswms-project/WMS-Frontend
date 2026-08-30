import {
  CYCLE_COUNT_STATUSES,
  STOCK_ADJUSTMENT_STATUSES,
  type CycleCountStatus,
  type StockAdjustmentStatus,
} from '../types/cycle-count.types'

export const CYCLE_COUNT_STATUS_LABELS: Record<CycleCountStatus, string> = {
  [CYCLE_COUNT_STATUSES.scheduled]: 'Đã lên lịch',
  [CYCLE_COUNT_STATUSES.counting]: 'Đang kiểm đếm',
  [CYCLE_COUNT_STATUSES.submitted]: 'Chờ quản lý duyệt',
  [CYCLE_COUNT_STATUSES.recount]: 'Yêu cầu đếm lại',
  [CYCLE_COUNT_STATUSES.completed]: 'Đã hoàn tất',
}

export const STOCK_ADJUSTMENT_STATUS_LABELS: Record<StockAdjustmentStatus, string> = {
  [STOCK_ADJUSTMENT_STATUSES.pending]: 'Chờ duyệt',
  [STOCK_ADJUSTMENT_STATUSES.approved]: 'Đã duyệt',
  [STOCK_ADJUSTMENT_STATUSES.rejected]: 'Đã từ chối',
}

export function formatCycleCountDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatCount(value: number | null): string {
  return value === null
    ? '—'
    : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)
}
