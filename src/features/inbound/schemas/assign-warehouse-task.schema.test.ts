import { describe, expect, it } from 'vitest'
import { createAssignWarehouseTaskSchema } from './inbound.schema'

describe('assign warehouse task schema', () => {
  it('requires only a staff member for a first assignment', () => {
    const schema = createAssignWarehouseTaskSchema(null)

    expect(schema.safeParse({ staffId: 'staff-1', reason: '' }).success).toBe(true)
    expect(schema.safeParse({ staffId: '', reason: '' }).success).toBe(false)
  })

  it('requires a reason and a different staff member when reassigning', () => {
    const schema = createAssignWarehouseTaskSchema('staff-1')

    const missingReason = schema.safeParse({ staffId: 'staff-2', reason: '   ' })
    expect(missingReason.success).toBe(false)
    expect(missingReason.error?.issues.map((issue) => issue.path.join('.'))).toContain('reason')

    const sameStaff = schema.safeParse({ staffId: 'staff-1', reason: 'Nghỉ phép' })
    expect(sameStaff.success).toBe(false)
    expect(sameStaff.error?.issues.map((issue) => issue.path.join('.'))).toContain('staffId')

    expect(schema.safeParse({ staffId: 'staff-2', reason: 'Nghỉ phép' }).success).toBe(true)
  })
})
