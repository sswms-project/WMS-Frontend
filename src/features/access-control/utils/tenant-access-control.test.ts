import { describe, expect, it } from 'vitest'
import { P } from '@/config/permissionCodes'
import type { TenantAssignablePermission } from '../types/tenant-access-control.types'
import {
  arePermissionSetsEqual,
  createPersonalPermissionRow,
  filterPermissionGroups,
  filterPermissionGroupsByIds,
  getCustomizedPermissionIds,
  groupTenantPermissions,
} from './tenant-access-control'

const warehouseViewPermission: TenantAssignablePermission = {
  id: 'a73b60fa-0e18-49bc-936c-bc568b72b486',
  permissionKey: P.WAREHOUSES_VIEW,
  module: 'warehouses',
  moduleDisplayName: 'Kho hàng',
  displayName: 'Xem kho hàng',
  description: 'Xem danh sách kho được giao.',
  eligibleRoles: ['Warehouse Manager', 'Warehouse Staff'],
}

const inventoryViewPermission: TenantAssignablePermission = {
  id: 'c0391037-32dc-4dd8-bc61-7cc04777dcff',
  permissionKey: P.INVENTORY_VIEW,
  module: 'inventory',
  moduleDisplayName: 'Tồn kho',
  displayName: 'Xem tồn kho',
  description: 'Xem số lượng tồn hiện tại.',
  eligibleRoles: ['Warehouse Manager', 'Warehouse Staff'],
}

const permissions = [warehouseViewPermission, inventoryViewPermission]

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
    ).toEqual([inventoryViewPermission])
    expect(filterPermissionGroups(groups, P.WAREHOUSES_VIEW)).toHaveLength(1)
    expect(filterPermissionGroups(groups, 'không tồn tại')).toEqual([])
  })

  it('compares permission sets without relying on insertion order', () => {
    expect(arePermissionSetsEqual(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true)
    expect(arePermissionSetsEqual(new Set(['a']), new Set(['a', 'b']))).toBe(false)
  })

  it('derives customized permissions by symmetric difference from role defaults', () => {
    const customized = getCustomizedPermissionIds(
      new Set([warehouseViewPermission.id, 'granted']),
      new Set([warehouseViewPermission.id, 'denied'])
    )

    expect([...customized].sort()).toEqual(['denied', 'granted'])
  })

  it('marks a personal row customized without exposing grant or deny semantics', () => {
    const row = createPersonalPermissionRow(
      warehouseViewPermission,
      'Warehouse Staff',
      new Set(),
      new Set([warehouseViewPermission.id])
    )

    expect(row).toMatchObject({
      checked: false,
      editable: true,
      presentation: 'personal-customized',
    })
  })

  it('filters permission groups to the selected permission identifiers', () => {
    const groups = groupTenantPermissions(permissions)
    const result = filterPermissionGroupsByIds(groups, new Set([inventoryViewPermission.id]))

    expect(result).toHaveLength(1)
    expect(result[0]?.permissions).toEqual([inventoryViewPermission])
  })
})
