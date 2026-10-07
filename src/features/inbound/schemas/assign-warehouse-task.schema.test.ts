import { describe, expect, it } from 'vitest'
import { assignWarehouseTaskSchema } from './inbound.schema'

describe('assign warehouse task schema', () => {
  const validTask = { staffId: 'staff-1', priority: 'Normal', dueAt: '', reason: '' } as const

  it('requires a staff member', () => {
    expect(assignWarehouseTaskSchema.safeParse(validTask).success).toBe(true)
    expect(assignWarehouseTaskSchema.safeParse({ ...validTask, staffId: '' }).success).toBe(false)
  })

  it('caps the reason length', () => {
    const tooLong = 'a'.repeat(501)
    expect(assignWarehouseTaskSchema.safeParse({ ...validTask, reason: tooLong }).success).toBe(
      false
    )
    expect(assignWarehouseTaskSchema.safeParse({ ...validTask, reason: 'Nghỉ phép' }).success).toBe(
      true
    )
  })

  it('requires a future deadline for urgent work', () => {
    expect(assignWarehouseTaskSchema.safeParse({ ...validTask, priority: 'Urgent' }).success).toBe(
      false
    )
    expect(
      assignWarehouseTaskSchema.safeParse({
        ...validTask,
        priority: 'Urgent',
        dueAt: '2999-01-01T08:00',
      }).success
    ).toBe(true)
  })
})
