import { USER_ROLES, type UserRole } from '@/config/roles'

export interface WarehouseCapabilities {
  readonly canCreateWarehouse: boolean
  readonly canEditWarehouse: boolean
  readonly canDeactivateWarehouse: boolean
  readonly canConfigureLayout: boolean
  readonly canGenerateLocationBarcode: boolean
}

export function getWarehouseCapabilities(role: UserRole | null): WarehouseCapabilities {
  const isTenantOwner = role === USER_ROLES.TenantOwner
  const isWarehouseManager = role === USER_ROLES.WarehouseManager

  return {
    canCreateWarehouse: isTenantOwner,
    canEditWarehouse: isTenantOwner || isWarehouseManager,
    canDeactivateWarehouse: isTenantOwner,
    canConfigureLayout: isTenantOwner || isWarehouseManager,
    canGenerateLocationBarcode: isTenantOwner || isWarehouseManager,
  }
}
