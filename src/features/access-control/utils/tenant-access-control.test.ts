import { describe, expect, it } from 'vitest'
import type { TenantAssignablePermission } from '../types/tenant-access-control.types'
import {
  createPersonalPermissionRow,
  createRolePermissionRow,
  rebasePermissionDraft,
} from './tenant-access-control'

const permission: TenantAssignablePermission = {
  id: 'permission-1',
  permissionKey: 'products:create',
  module: 'Products',
  moduleDisplayName: 'Sản phẩm',
  displayName: 'Tạo sản phẩm',
  description: 'Cho phép tạo sản phẩm mới.',
}

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
