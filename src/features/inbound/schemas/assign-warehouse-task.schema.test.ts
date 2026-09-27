import { describe, expect, it } from 'vitest'
import { assignWarehouseTaskSchema } from './inbound.schema'

describe('assign warehouse task schema', () => {
  it('requires a staff member', () => {
    expect(assignWarehouseTaskSchema.safeParse({ staffId: 'staff-1', reason: '' }).success).toBe(
      true
    )
    expect(assignWarehouseTaskSchema.safeParse({ staffId: '', reason: '' }).success).toBe(false)
  })

  it('caps the reason length', () => {
    const tooLong = 'a'.repeat(501)
    expect(
      assignWarehouseTaskSchema.safeParse({ staffId: 'staff-1', reason: tooLong }).success
    ).toBe(false)
    expect(
      assignWarehouseTaskSchema.safeParse({ staffId: 'staff-1', reason: 'Nghỉ phép' }).success
    ).toBe(true)
  })
})
