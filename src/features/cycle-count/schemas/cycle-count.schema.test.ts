import { describe, expect, it } from 'vitest'
import { createCycleCountSchema, recountSchema, stockAdjustmentSchema } from './cycle-count.schema'

const guid = '00000000-0000-0000-0000-000000000001'

describe('cycle count schemas', () => {
  it('accepts a valid blind-count request', () => {
    expect(
      createCycleCountSchema.safeParse({
        warehouseId: guid,
        zoneId: '',
        scheduledDate: '2026-08-25T10:00',
        assignedTo: guid,
        items: [{ productId: guid, slotId: guid }],
        isBlindCount: true,
      }).success
    ).toBe(true)
  })

  it('rejects duplicate inventory lines', () => {
    const item = { productId: guid, slotId: guid }
    expect(
      createCycleCountSchema.safeParse({
        warehouseId: guid,
        zoneId: '',
        scheduledDate: '2026-08-25T10:00',
        assignedTo: guid,
        items: [item, item],
        isBlindCount: true,
      }).success
    ).toBe(false)
  })

  it('requires a reason for recount and adjustment', () => {
    expect(recountSchema.safeParse({ itemIds: [guid], reason: ' ' }).success).toBe(false)
    expect(stockAdjustmentSchema.safeParse({ cycleCountItemId: guid, reason: ' ' }).success).toBe(
      false
    )
  })
})
