import { describe, expect, it } from 'vitest'
import { createProductSchema, stockPolicySchema } from './product.schema'

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

describe('capacity product conversion regression', () => {
  const product = {
    sku: 'SKU',
    productName: 'Lon nước',
    description: null,
    unitId: 'can',
    categoryId: 'drinks',
    isLotTracked: false,
    shelfLifeDays: null,
    unitConversions: [{ unitId: 'carton', conversionFactor: 24 }],
  }
  it('preserves the alternative-to-base factor contract', () => {
    expect(createProductSchema.parse(product).unitConversions).toEqual([
      { unitId: 'carton', conversionFactor: 24 },
    ])
  })
  it('rejects the base unit, duplicate alternatives and non-positive factors', () => {
    for (const unitConversions of [
      [{ unitId: 'can', conversionFactor: 1 }],
      [product.unitConversions[0], product.unitConversions[0]],
      [{ unitId: 'carton', conversionFactor: 0 }],
    ]) {
      expect(createProductSchema.safeParse({ ...product, unitConversions }).success).toBe(false)
    }
  })
})
