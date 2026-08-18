import type { WarehouseSummaryResponse } from '../types/manager-assignment.types'

export function getActiveWarehouses(warehouses: readonly WarehouseSummaryResponse[]) {
  return warehouses.filter((warehouse) => warehouse.status.toLowerCase() === 'active')
}
