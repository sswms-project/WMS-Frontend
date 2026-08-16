export const USER_ROLES = {
  SystemAdmin: 'System Admin',
  TenantOwner: 'Tenant Owner',
  WarehouseManager: 'Warehouse Manager',
  WarehouseStaff: 'Warehouse Staff',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS_VI: Record<UserRole, string> = {
  [USER_ROLES.TenantOwner]: 'Chủ doanh nghiệp',
  [USER_ROLES.WarehouseManager]: 'Quản lý kho',
  [USER_ROLES.WarehouseStaff]: 'Nhân viên kho',
  [USER_ROLES.SystemAdmin]: 'Quản trị hệ thống',
}
