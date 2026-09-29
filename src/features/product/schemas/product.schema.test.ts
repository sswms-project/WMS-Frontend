import { describe, expect, it } from 'vitest'
import { stockPolicySchema } from './product.schema'

const validPolicy = {
  preferredSlotId: null,
  minStockThreshold: 0,
  maxStockThreshold: null,
  reorderPoint: null,
  safetyStock: 0,
  leadTimeDays: null,
}

describe('stockPolicySchema', () => {
  it('requires a warehouse for the single-warehouse scope', () => {
    const result = stockPolicySchema.safeParse({
      ...validPolicy,
      scope: 'single',
      warehouseId: '',
    })

    expect(result.success).toBe(false)
  })

  it('allows an empty warehouse for the all-warehouses scope', () => {
    const result = stockPolicySchema.safeParse({
      ...validPolicy,
      scope: 'all',
      warehouseId: '',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a warehouse-specific preferred slot for the all-warehouses scope', () => {
    const result = stockPolicySchema.safeParse({
      ...validPolicy,
      scope: 'all',
      warehouseId: '',
      preferredSlotId: 'slot-id',
    })

    expect(result.success).toBe(false)
  })
})
