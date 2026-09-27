export const USER_ROLES = {
  SystemAdmin: 'System Admin',
  TenantOwner: 'Tenant Owner',
  WarehouseManager: 'Warehouse Manager',
  WarehouseStaff: 'Warehouse Staff',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS_VI: Readonly<Record<string, string>> = {
  [USER_ROLES.TenantOwner]: 'Chủ doanh nghiệp',
  [USER_ROLES.WarehouseManager]: 'Quản lý kho',
  [USER_ROLES.WarehouseStaff]: 'Nhân viên kho',
  [USER_ROLES.SystemAdmin]: 'Quản trị hệ thống',
}

export const DEFAULT_TENANT_ROLE_TEMPLATE_DESCRIPTION = 'Mẫu quyền mặc định cho đơn vị thuê mới.'

export function getRoleLabel(roleName: string): string {
  return ROLE_LABELS_VI[roleName] ?? roleName
}

export function getRoleDescription(roleName: string, description?: string | null): string {
  if (roleName === USER_ROLES.WarehouseManager || roleName === USER_ROLES.WarehouseStaff) {
    return DEFAULT_TENANT_ROLE_TEMPLATE_DESCRIPTION
  }

  return description || 'Chưa có mô tả'
}
