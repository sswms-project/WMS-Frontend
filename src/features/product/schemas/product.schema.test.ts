import { describe, expect, it } from 'vitest'
import { createProductSchema, stockPolicySchema, updateProductSchema } from './product.schema'

const baseProduct = {
  sku: 'SKU-001',
  productName: 'Bộ điều khiển',
  description: null,
  unitId: 'unit-1',
  categoryId: 'category-1',
  unitConversions: [],
}

describe('product schemas', () => {
  it('accepts quantity-only products only without shelf life', () => {
    expect(
      createProductSchema.safeParse({
        ...baseProduct,
        isLotTracked: false,
        shelfLifeDays: null,
      }).success
    ).toBe(true)
    expect(
      createProductSchema.safeParse({
        ...baseProduct,
        isLotTracked: false,
        shelfLifeDays: 30,
      }).success
    ).toBe(false)
  })

  it('accepts lot tracking with optional positive shelf life', () => {
    expect(
      createProductSchema.safeParse({
        ...baseProduct,
        isLotTracked: true,
        shelfLifeDays: null,
      }).success
    ).toBe(true)
    expect(
      updateProductSchema.safeParse({
        productName: baseProduct.productName,
        description: null,
        unitId: baseProduct.unitId,
        categoryId: baseProduct.categoryId,
        isLotTracked: true,
        shelfLifeDays: 0,
      }).success
    ).toBe(false)
  })

  it('validates warehouse policy bounds', () => {
    const policy = {
      warehouseId: 'warehouse-1',
      preferredSlotId: null,
      minStockThreshold: 10,
      maxStockThreshold: 5,
      reorderPoint: 8,
      safetyStock: 2,
      leadTimeDays: 3,
    }
    expect(stockPolicySchema.safeParse(policy).success).toBe(false)
    expect(stockPolicySchema.safeParse({ ...policy, maxStockThreshold: 20 }).success).toBe(true)
  })
})
