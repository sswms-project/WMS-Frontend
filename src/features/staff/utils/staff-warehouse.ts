import type { WarehouseSummaryResponse } from '../types/manager-assignment.types'
import type { StaffResponse } from '../types/staff.types'

export function getAssignedWarehouseIds(person: StaffResponse): string[] {
  return person.assignedWarehouseIds
}

export function resolveStaffWarehouseScope(
  assignedIds: string[],
  warehouses: readonly WarehouseSummaryResponse[]
): { warehouses: WarehouseSummaryResponse[]; unresolvedCount: number } {
  const idSet = new Set(assignedIds)
  const resolved = warehouses.filter((warehouse) => idSet.has(warehouse.id))
  return { warehouses: resolved, unresolvedCount: assignedIds.length - resolved.length }
}

export function staffWarehouseScopeSummary(
  assignedIds: string[],
  warehouses: readonly WarehouseSummaryResponse[]
): string {
  if (assignedIds.length === 0) return 'Chưa gán kho'
  const { warehouses: resolved, unresolvedCount } = resolveStaffWarehouseScope(
    assignedIds,
    warehouses
  )
  if (resolved.length === 0) return `${assignedIds.length} kho`
  const names = resolved.map((warehouse) => warehouse.warehouseCode).join(', ')
  return unresolvedCount > 0 ? `${names} +${unresolvedCount}` : names
}
