import { P, type PermissionCode } from '@/config/permissionCodes'
import { USER_ROLES, type UserRole } from '@/config/roles'

export interface WarehouseCapabilities {
  readonly canCreateWarehouse: boolean
  readonly canEditWarehouse: boolean
  readonly canDeactivateWarehouse: boolean
  readonly canConfigureLayout: boolean
  readonly canGenerateLocationBarcode: boolean
}

export function getWarehouseCapabilities(
  role: UserRole | null,
  permissions: readonly string[] = []
): WarehouseCapabilities {
  const isTenantOwner = role === USER_ROLES.TenantOwner
  const hasPermission = (permission: PermissionCode) =>
    isTenantOwner || permissions.includes(permission)

  return {
    canCreateWarehouse: isTenantOwner,
    canEditWarehouse: hasPermission(P.WAREHOUSES_UPDATE),
    canDeactivateWarehouse: isTenantOwner,
    canConfigureLayout: hasPermission(P.WAREHOUSES_CONFIGURE_LAYOUT),
    canGenerateLocationBarcode: hasPermission(P.WAREHOUSES_GENERATE_BARCODE),
  }
}
