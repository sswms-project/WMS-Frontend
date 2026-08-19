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

export function staffWarehouseScopeSummary(
  assignedIds: readonly string[],
  warehouses: readonly WarehouseSummaryResponse[]
) {
  if (assignedIds.length === 0) return staffWarehouseScopeLabel(0)

  const scope = resolveStaffWarehouseScope(assignedIds, warehouses)
  const firstWarehouse = scope.warehouses[0]
  if (!firstWarehouse) return staffWarehouseScopeLabel(assignedIds.length)

  const remainingCount = assignedIds.length - 1
  const firstWarehouseLabel = `${firstWarehouse.warehouseCode} · ${firstWarehouse.warehouseName}`
  return remainingCount > 0 ? `${firstWarehouseLabel} +${remainingCount}` : firstWarehouseLabel
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
