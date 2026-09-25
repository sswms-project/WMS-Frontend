import { describe, expect, it } from 'vitest'
import { categorySchema, productUnitConversionSchema, unitSchema } from './master-data.schema'

describe('master data schemas', () => {
  it('accepts a unit with precision from 0 to 6', () => {
    expect(
      unitSchema.safeParse({
        unitCode: 'BOX',
        unitName: 'Thùng',
        symbol: 'thùng',
        quantityPrecision: 0,
        description: '',
      }).success
    ).toBe(true)
    expect(
      unitSchema.safeParse({
        unitCode: 'KG',
        unitName: 'Kilôgam',
        symbol: 'kg',
        quantityPrecision: 7,
        description: '',
      }).success
    ).toBe(false)
  })

  it('requires category name and a positive conversion factor', () => {
    expect(
      categorySchema.safeParse({
        categoryCode: '',
        categoryName: '',
        parentCategoryId: null,
        description: '',
      }).success
    ).toBe(false)
    expect(
      productUnitConversionSchema.safeParse({ unitId: 'unit-id', conversionFactor: 0 }).success
    ).toBe(false)
    expect(
      productUnitConversionSchema.safeParse({ unitId: 'unit-id', conversionFactor: 24 }).success
    ).toBe(true)
  })
})
