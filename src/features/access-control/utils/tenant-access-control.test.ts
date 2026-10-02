import { describe, expect, it } from 'vitest'
import type { TenantAssignablePermission } from '../types/tenant-access-control.types'
import {
  createPersonalPermissionRow,
  createRolePermissionRow,
  filterPermissionGroups,
  filterPermissionGroupsByIds,
  groupTenantPermissions,
  rebasePermissionDraft,
} from './tenant-access-control'

function createPermission(
  overrides: Partial<TenantAssignablePermission> = {}
): TenantAssignablePermission {
  return {
    id: 'permission-1',
    permissionKey: 'products:create',
    module: 'products',
    moduleDisplayName: 'Sản phẩm',
    displayName: 'Tạo sản phẩm',
    description: 'Cho phép tạo sản phẩm mới.',
    category: 'catalog',
    categoryDisplayName: 'Danh mục',
    categoryDescription: 'Vật tư hàng hóa, nhóm và đơn vị tính.',
    categoryOrder: 4,
    moduleOrder: 0,
    ...overrides,
  }
}

const permission = createPermission()

describe('tenant access-control permission rows', () => {
  it('keeps every ceiling permission editable for an operational role', () => {
    const unselected = createRolePermissionRow(permission, new Set())
    const selected = createRolePermissionRow(permission, new Set([permission.id]))

    expect(unselected).toMatchObject({ checked: false, editable: true })
    expect(selected).toMatchObject({ checked: true, editable: true })
  })

  it('keeps a personal override editable inside the same ceiling', () => {
    const row = createPersonalPermissionRow(permission, new Set([permission.id]), new Set())

    expect(row).toMatchObject({
      checked: true,
      editable: true,
      presentation: 'personal-customized',
    })
  })

  it('rebases unsaved changes and removes permissions revoked from the ceiling', () => {
    const result = rebasePermissionDraft(
      new Set(['kept', 'removed', 'locally-removed']),
      new Set(['kept', 'removed', 'local-addition']),
      new Set(['kept', 'external-addition', 'locally-removed']),
      new Set(['kept', 'external-addition', 'locally-removed', 'local-addition'])
    )

    expect([...result.baselineIds]).toEqual(['kept', 'external-addition', 'locally-removed'])
    expect([...result.draftIds]).toEqual(['kept', 'external-addition', 'local-addition'])
  })
})

describe('tenant access-control permission categories', () => {
  const permissions = [
    createPermission({
      id: 'units-manage',
      permissionKey: 'units:manage',
      module: 'units',
      moduleDisplayName: 'Đơn vị tính',
      displayName: 'Quản lý đơn vị tính',
      description: 'Quản lý danh sách đơn vị tính.',
      moduleOrder: 2,
    }),
    createPermission({
      id: 'products-view',
      permissionKey: 'products:view',
      displayName: 'Xem sản phẩm',
      description: 'Xem danh mục và thông tin sản phẩm.',
    }),
    createPermission({
      id: 'products-create',
      displayName: 'Tạo sản phẩm',
    }),
    createPermission({
      id: 'warehouse-view',
      permissionKey: 'warehouses:view',
      module: 'warehouses',
      moduleDisplayName: 'Kho hàng',
      displayName: 'Xem kho hàng',
      description: 'Xem cấu trúc và sơ đồ kho.',
      category: 'warehouse-management',
      categoryDisplayName: 'Quản lý kho',
      categoryDescription: 'Kho hàng, cấu trúc và sơ đồ kho.',
      categoryOrder: 2,
      moduleOrder: 0,
    }),
  ]

  it('groups by backend category metadata and preserves numeric ordering', () => {
    const groups = groupTenantPermissions(permissions)

    expect(groups.map((category) => category.category)).toEqual(['warehouse-management', 'catalog'])
    expect(groups[1]?.modules.map((module) => module.module)).toEqual(['products', 'units'])
    expect(groups[1]?.modules[0]?.permissions.map((item) => item.displayName)).toEqual([
      'Tạo sản phẩm',
      'Xem sản phẩm',
    ])
  })

  it.each([
    { label: 'category name', searchText: 'quản lý kho', expectedIds: ['warehouse-view'] },
    { label: 'category description', searchText: 'sơ đồ kho', expectedIds: ['warehouse-view'] },
    { label: 'module key', searchText: 'units', expectedIds: ['units-manage'] },
    { label: 'permission name', searchText: 'tạo sản phẩm', expectedIds: ['products-create'] },
    { label: 'permission key', searchText: 'products:view', expectedIds: ['products-view'] },
  ])('filters the hierarchy by $label', ({ searchText, expectedIds }) => {
    const result = filterPermissionGroups(groupTenantPermissions(permissions), searchText)

    expect(
      result.flatMap((category) =>
        category.modules.flatMap((module) => module.permissions.map((item) => item.id))
      )
    ).toEqual(expectedIds)
  })

  it('keeps the category and module hierarchy when filtering customized permissions', () => {
    const result = filterPermissionGroupsByIds(
      groupTenantPermissions(permissions),
      new Set(['products-view', 'warehouse-view'])
    )

    expect(result.map((category) => category.category)).toEqual(['warehouse-management', 'catalog'])
    expect(result[1]?.modules.map((module) => module.module)).toEqual(['products'])
    expect(result[1]?.modules[0]?.permissions.map((item) => item.id)).toEqual(['products-view'])
  })
})
