import { USER_ROLES, type UserRole } from '@/config/roles'

export interface WarehouseCapabilities {
  readonly canCreateWarehouse: boolean
  readonly canEditWarehouse: boolean
  readonly canDeactivateWarehouse: boolean
  readonly canConfigureLayout: boolean
  readonly canGenerateLocationBarcode: boolean
  readonly canConfigureOutboundStaging: boolean
}

export function getWarehouseCapabilities(
  role: UserRole | null,
  permissions: readonly string[] = []
): WarehouseCapabilities {
  const isTenantOwner = role === USER_ROLES.TenantOwner
  const hasPermission = (permission: string) => isTenantOwner || permissions.includes(permission)

  return {
    canCreateWarehouse: isTenantOwner,
    canEditWarehouse: hasPermission('warehouses:update'),
    canDeactivateWarehouse: isTenantOwner,
    canConfigureLayout: hasPermission('warehouses:configure-layout'),
    canGenerateLocationBarcode: hasPermission('warehouses:generate-barcode'),
    canConfigureOutboundStaging: hasPermission('warehouses:configure-staging'),
  }
}
