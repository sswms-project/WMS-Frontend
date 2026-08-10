import { USER_ROLES, type UserRole } from '@/config/roles'

export interface WarehouseCapabilities {
  readonly canCreateWarehouse: boolean
  readonly canEditWarehouse: boolean
  readonly canDeactivateWarehouse: boolean
  readonly canConfigureLayout: boolean
}

export function getWarehouseCapabilities(role: UserRole | null): WarehouseCapabilities {
  const isTenantOwner = role === USER_ROLES.TenantOwner
  const isWarehouseManager = role === USER_ROLES.WarehouseManager

  return {
    canCreateWarehouse: isTenantOwner,
    canEditWarehouse: isTenantOwner,
    canDeactivateWarehouse: isTenantOwner,
    canConfigureLayout: isTenantOwner || isWarehouseManager,
  }
}
