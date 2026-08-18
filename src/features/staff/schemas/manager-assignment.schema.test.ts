import { describe, expect, it } from 'vitest'
import { managerAssignmentSchema } from './manager-assignment.schema'

describe('manager assignment schema', () => {
  it('accepts a warehouse id', () => {
    expect(
      managerAssignmentSchema.safeParse({
        warehouseId: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
      }).success
    ).toBe(true)
  })

  it('accepts SQL Server sequential GUID warehouse ids', () => {
    expect(
      managerAssignmentSchema.safeParse({
        warehouseId: '111f3ff3-d0b1-4120-209e-08defd3c2689',
      }).success
    ).toBe(true)
  })

  it('rejects an empty or malformed warehouse id', () => {
    expect(managerAssignmentSchema.safeParse({ warehouseId: '' }).success).toBe(false)
    expect(managerAssignmentSchema.safeParse({ warehouseId: 'warehouse-1' }).success).toBe(false)
  })
})
