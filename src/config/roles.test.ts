import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TENANT_ROLE_TEMPLATE_DESCRIPTION,
  getRoleDescription,
  getRoleLabel,
  USER_ROLES,
} from './roles'

describe('role display metadata', () => {
  it('uses Vietnamese labels for system roles', () => {
    expect(getRoleLabel(USER_ROLES.SystemAdmin)).toBe('Quản trị hệ thống')
    expect(getRoleLabel(USER_ROLES.TenantOwner)).toBe('Chủ doanh nghiệp')
    expect(getRoleLabel(USER_ROLES.WarehouseManager)).toBe('Quản lý kho')
    expect(getRoleLabel(USER_ROLES.WarehouseStaff)).toBe('Nhân viên kho')
  })

  it('identifies manager and staff roles as default templates for new tenants', () => {
    expect(getRoleDescription(USER_ROLES.WarehouseManager, 'Mô tả cũ')).toBe(
      DEFAULT_TENANT_ROLE_TEMPLATE_DESCRIPTION
    )
    expect(getRoleDescription(USER_ROLES.WarehouseStaff, 'Mô tả cũ')).toBe(
      DEFAULT_TENANT_ROLE_TEMPLATE_DESCRIPTION
    )
  })
})
