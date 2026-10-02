import type { StorageCapacityResponse } from '../types/warehouse.types'

export interface CapacityLocation extends StorageCapacityResponse {
  capacity?: number | null
  currentOccupancy?: number | null
  isOutboundStaging?: boolean
}

const CAPACITY_WARNING_PERCENT = 80

export function getCapacityUtilization(location: CapacityLocation) {
  if (
    location.capacityType !== 'Quantity' ||
    location.requiresCapacityConfiguration ||
    location.capacityUsed == null ||
    location.capacity == null ||
    !Number.isFinite(location.capacityUsed) ||
    !Number.isFinite(location.capacity) ||
    location.capacityUsed < 0 ||
    location.capacity <= 0
  )
    return null
  const rawPercent = (location.capacityUsed / location.capacity) * 100
  return {
    used: location.capacityUsed,
    maximum: location.capacity,
    rawPercent,
    percent: Math.min(rawPercent, 100),
    status:
      rawPercent >= 100 ? 'full' : rawPercent >= CAPACITY_WARNING_PERCENT ? 'warning' : 'normal',
  }
}

export function formatStorageCapacity(location: CapacityLocation) {
  if (location.requiresCapacityConfiguration) return 'Cần cấu hình đơn vị sức chứa'
  if (location.capacityType == null)
    return location.capacity == null ? '—' : 'Cần tải lại chính sách sức chứa'
  if (location.capacityType === 'None') return 'Không giới hạn'
  const unit = location.capacityUnitName ?? location.capacityUnitSymbol ?? '—'
  const format = (value: number | null | undefined) =>
    value == null ? '—' : value.toLocaleString('vi-VN', { maximumFractionDigits: 6 })
  return `${format(location.capacityUsed)} / ${format(location.capacity)} ${unit} · Còn ${format(location.remainingCapacity)}${location.utilizationPercent == null ? '' : ` · ${format(location.utilizationPercent)}%`}`
}

export function getCapacityFormValues(location?: CapacityLocation) {
  return {
    capacityType: location?.capacityType === 'Quantity' ? ('Quantity' as const) : ('None' as const),
    capacity: location?.capacityType === 'Quantity' ? (location.capacity ?? null) : null,
    capacityUnitId:
      location?.capacityType === 'Quantity' ? (location.capacityUnitId ?? null) : null,
  }
}
