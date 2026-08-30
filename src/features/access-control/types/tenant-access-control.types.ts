export interface TenantRolePolicy {
  roleId: string
  roleName: string
  directPermissionIds: string[]
  inheritedPermissionIds: string[]
  effectivePermissionIds: string[]
}

export interface TenantAssignablePermission {
  id: string
  permissionKey: string
  module: string
  moduleDisplayName: string
  displayName: string
  description: string
  eligibleRoles: string[]
}

export interface TenantRolePermissionWorkspace {
  roles: TenantRolePolicy[]
  permissions: TenantAssignablePermission[]
}

export interface PermissionModuleGroup {
  module: string
  moduleDisplayName: string
  permissions: TenantAssignablePermission[]
}
