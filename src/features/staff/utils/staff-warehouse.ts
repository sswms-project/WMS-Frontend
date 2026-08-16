import type { WarehouseSummaryResponse } from '../types/manager-assignment.types'
import type { StaffResponse } from '../types/staff.types'

export interface ResolvedStaffWarehouseScope {
  readonly assignedIds: readonly string[]
  readonly warehouses: readonly WarehouseSummaryResponse[]
  readonly unresolvedCount: number
}

export function getAssignedWarehouseIds(
  person: Pick<StaffResponse, 'assignedWarehouseIds'>
): readonly string[] {
  return Array.isArray(person.assignedWarehouseIds) ? person.assignedWarehouseIds : []
}

export function staffWarehouseScopeLabel(count: number) {
  if (count === 0) return 'Chưa gán kho'
  return `${count} kho được gán`
}

export function resolveStaffWarehouseScope(
  assignedIds: readonly string[],
  warehouses: readonly WarehouseSummaryResponse[]
): ResolvedStaffWarehouseScope {
  const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]))
  const resolved = assignedIds.flatMap((id) => {
    const warehouse = warehouseById.get(id)
    return warehouse ? [warehouse] : []
  })

  return {
    assignedIds,
    warehouses: resolved,
    unresolvedCount: assignedIds.length - resolved.length,
  }
}
