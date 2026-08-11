import type { WarehouseLocationType } from '../types/warehouse.types'

export function parseWarehouseLocationType(value: string): WarehouseLocationType | null {
  const normalizedValue = value.toLowerCase()
  if (normalizedValue === 'zone') return 'Zone'
  if (normalizedValue === 'rack') return 'Rack'
  if (normalizedValue === 'slot') return 'Slot'
  return null
}
