import { describe, expect, it } from 'vitest'
import type { TenantAssignablePermission } from '../types/tenant-access-control.types'
import {
  arePermissionSetsEqual,
  filterPermissionGroups,
  groupTenantPermissions,
} from './tenant-access-control'

const permissions: TenantAssignablePermission[] = [
  {
    id: 'a73b60fa-0e18-49bc-936c-bc568b72b486',
    permissionKey: 'warehouses:view',
    module: 'warehouses',
    moduleDisplayName: 'Kho hàng',
    displayName: 'Xem kho hàng',
    description: 'Xem danh sách kho được giao.',
    eligibleRoles: ['Warehouse Manager', 'Warehouse Staff'],
  },
  {
    id: 'c0391037-32dc-4dd8-bc61-7cc04777dcff',
    permissionKey: 'inventory:view',
    module: 'inventory',
    moduleDisplayName: 'Tồn kho',
    displayName: 'Xem tồn kho',
    description: 'Xem số lượng tồn hiện tại.',
    eligibleRoles: ['Warehouse Manager', 'Warehouse Staff'],
  },
]

describe('tenant access-control utilities', () => {
  it('groups and sorts the server-provided catalog by Vietnamese module label', () => {
    expect(groupTenantPermissions(permissions).map((group) => group.moduleDisplayName)).toEqual([
      'Kho hàng',
      'Tồn kho',
    ])
  })

  it('searches action, description, module, and technical key', () => {
    const groups = groupTenantPermissions(permissions)

    expect(
      filterPermissionGroups(groups, 'số lượng').flatMap((group) => group.permissions)
    ).toEqual([permissions[1]])
    expect(filterPermissionGroups(groups, 'warehouses:view')).toHaveLength(1)
    expect(filterPermissionGroups(groups, 'không tồn tại')).toEqual([])
  })

  it('compares permission sets without relying on insertion order', () => {
    expect(arePermissionSetsEqual(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true)
    expect(arePermissionSetsEqual(new Set(['a']), new Set(['a', 'b']))).toBe(false)
  })
})
