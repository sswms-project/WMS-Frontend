import { describe, expect, it } from 'vitest'
import { resetTenantUserPermissionsSchema } from './reset-tenant-user-permissions.schema'
import { updateTenantUserPermissionsSchema } from './update-tenant-user-permissions.schema'

describe('tenant user permission schemas', () => {
  const managerRoleId = '4b335696-d99a-8fd8-864d-f86a32be1781'
  const staffRoleId = '1a13e448-0388-da07-2782-cf395c564951'
  const permissionId = 'a73b60fa-0e18-49bc-936c-bc568b72b486'

  it('accepts deterministic .NET role GUIDs and complete effective permission lists', () => {
    expect(
      updateTenantUserPermissionsSchema.safeParse({
        expectedRoleId: managerRoleId,
        permissionIds: [],
      }).success
    ).toBe(true)
    expect(
      updateTenantUserPermissionsSchema.safeParse({
        expectedRoleId: staffRoleId,
        permissionIds: [permissionId],
      }).success
    ).toBe(true)
    expect(
      resetTenantUserPermissionsSchema.safeParse({ expectedRoleId: staffRoleId }).success
    ).toBe(true)
  })

  it('rejects malformed role and permission identifiers', () => {
    expect(
      updateTenantUserPermissionsSchema.safeParse({
        expectedRoleId: 'manager',
        permissionIds: ['view'],
      }).success
    ).toBe(false)
    expect(resetTenantUserPermissionsSchema.safeParse({ expectedRoleId: '' }).success).toBe(false)
    expect(
      resetTenantUserPermissionsSchema.safeParse({
        expectedRoleId: '00000000-0000-0000-0000-000000000000',
      }).success
    ).toBe(false)
  })
})
