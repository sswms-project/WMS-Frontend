import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { inviteWithWarehouseSchema } from './invite-with-warehouse.schema'

const warehouseId = '497f6eca-6276-4993-bfeb-53cbbbba6f08'

describe('invite with warehouse schema', () => {
  it('accepts a staff invitation without an initial warehouse', () => {
    expect(
      inviteWithWarehouseSchema.safeParse({
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
      }).success
    ).toBe(true)
  })

  it('accepts a staff invitation with a warehouse id', () => {
    expect(
      inviteWithWarehouseSchema.safeParse({
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
        warehouseId,
      }).success
    ).toBe(true)
  })

  it('accepts a staff invitation with a SQL Server sequential GUID warehouse id', () => {
    expect(
      inviteWithWarehouseSchema.safeParse({
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
        warehouseId: '327e070f-f2e8-4070-4163-08def752f423',
      }).success
    ).toBe(true)
  })

  it('rejects malformed warehouse ids', () => {
    expect(
      inviteWithWarehouseSchema.safeParse({
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
        warehouseId: 'warehouse-1',
      }).success
    ).toBe(false)
  })

  it('does not let a manager invitation bypass the manager assignment flow', () => {
    expect(
      inviteWithWarehouseSchema.safeParse({
        email: 'manager@example.com',
        role: USER_ROLES.WarehouseManager,
        warehouseId,
      }).success
    ).toBe(false)
  })
})
