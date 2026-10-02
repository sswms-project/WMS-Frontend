import type { StorageCapacityResponse } from '../types/warehouse.types'

export interface CapacityLocation extends StorageCapacityResponse {
  capacity?: number | null
  currentOccupancy?: number | null
  isOutboundStaging?: boolean
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
