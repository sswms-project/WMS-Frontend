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

  it('rejects an empty or malformed warehouse id', () => {
    expect(managerAssignmentSchema.safeParse({ warehouseId: '' }).success).toBe(false)
    expect(managerAssignmentSchema.safeParse({ warehouseId: 'warehouse-1' }).success).toBe(false)
  })
})
