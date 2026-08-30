import { APP_ROUTES } from '@/routes/app-routes'
import { USER_ROLES, type UserRole } from './roles'

interface RoutePermission {
  pathPrefix: string
  allowedRoles: readonly UserRole[]
}

const ROUTE_PERMISSIONS: readonly RoutePermission[] = [
  { pathPrefix: '/admin', allowedRoles: [USER_ROLES.SystemAdmin] },
  { pathPrefix: APP_ROUTES.subscription, allowedRoles: [USER_ROLES.TenantOwner] },
  { pathPrefix: APP_ROUTES.organization, allowedRoles: [USER_ROLES.TenantOwner] },
  { pathPrefix: APP_ROUTES.settings.accessControl, allowedRoles: [USER_ROLES.TenantOwner] },
  {
    pathPrefix: APP_ROUTES.suppliers,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.purchaseOrders,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.products,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.inbound,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.inventory,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.transfers,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.orders,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.returns,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.delivery,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.customers,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.warehouses,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
  },
  {
    pathPrefix: APP_ROUTES.staff,
    allowedRoles: [USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager],
  },
  { pathPrefix: APP_ROUTES.dashboardByRole.tenant, allowedRoles: [USER_ROLES.TenantOwner] },
  { pathPrefix: APP_ROUTES.dashboardByRole.manager, allowedRoles: [USER_ROLES.WarehouseManager] },
  { pathPrefix: APP_ROUTES.dashboardByRole.staff, allowedRoles: [USER_ROLES.WarehouseStaff] },
]

function matchesPathPrefix(pathname: string, pathPrefix: string): boolean {
  return pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`)
}

export function getAllowedRolesForPath(pathname: string): readonly UserRole[] | null {
  const permission = ROUTE_PERMISSIONS.find((entry) =>
    matchesPathPrefix(pathname, entry.pathPrefix)
  )
  return permission?.allowedRoles ?? null
}
