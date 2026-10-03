import { describe, expect, it } from 'vitest'
import type { PermissionResponse } from '../types/admin.types'
import { filterAdminPermissionGroups, groupAdminPermissions } from './permission-catalog'

function createPermission(overrides: Partial<PermissionResponse> = {}): PermissionResponse {
  return {
    id: 'products-view',
    permissionKey: 'products:view',
    module: 'products',
    displayName: 'Xem sản phẩm',
    moduleDisplayName: 'Sản phẩm',
    description: 'Xem danh mục sản phẩm.',
    category: 'catalog',
    categoryDisplayName: 'Danh mục',
    categoryDescription: 'Vật tư hàng hóa, nhóm và đơn vị tính.',
    categoryOrder: 5,
    moduleOrder: 0,
    scope: 'TenantDelegatable',
    ...overrides,
  }
}

const permissions = [
  createPermission({
    id: 'units-view',
    permissionKey: 'units:view',
    module: 'units',
    moduleDisplayName: 'Đơn vị tính',
    displayName: 'Xem đơn vị tính',
    moduleOrder: 2,
  }),
  createPermission(),
  createPermission({
    id: 'roles-view',
    permissionKey: 'roles:view',
    module: 'roles',
    moduleDisplayName: 'Phân quyền',
    displayName: 'Xem vai trò',
    description: 'Xem vai trò toàn hệ thống.',
    category: 'platform-administration',
    categoryDisplayName: 'Quản trị nền tảng',
    categoryDescription: 'Đơn vị thuê, phân quyền và gói đăng ký.',
    categoryOrder: 1,
    moduleOrder: 1,
    scope: 'PlatformOnly',
  }),
]

describe('admin permission catalog', () => {
  it('groups permissions by backend metadata and preserves numeric order', () => {
    const groups = groupAdminPermissions(permissions)

    expect(groups.map((group) => group.category)).toEqual(['platform-administration', 'catalog'])
    expect(groups[1]?.modules.map((module) => module.module)).toEqual(['products', 'units'])
  })

  it.each([
    ['category description', 'gói đăng ký', ['roles-view']],
    ['module key', 'units', ['units-view']],
    ['permission key', 'products:view', ['products-view']],
  ])('filters by %s', (_, searchText, expectedIds) => {
    const groups = filterAdminPermissionGroups(groupAdminPermissions(permissions), searchText)

    expect(
      groups.flatMap((category) =>
        category.modules.flatMap((module) => module.permissions.map((permission) => permission.id))
      )
    ).toEqual(expectedIds)
  })
})
