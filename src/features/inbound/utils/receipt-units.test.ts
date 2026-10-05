import { describe, expect, it } from 'vitest'
import type { ReceivingTaskLine } from '../types/inbound.types'
import { getDefaultReceiptUnit, getReceiptUnit } from './receipt-units'

const line: ReceivingTaskLine = {
  inboundRequestItemId: 'line',
  productId: 'product',
  productSKU: 'BIA',
  productName: 'Bia',
  barcodeValue: null,
  isLotTracked: false,
  orderedQuantity: 240,
  receivedQuantity: 0,
  remainingQuantity: 240,
  baseUnitId: 'lon',
  baseUnitName: 'Lon',
  enteredUnitId: 'thung',
  enteredUnitName: 'Thùng',
  conversionFactorSnapshot: 24,
  baseUnitQuantityPrecision: 0,
  enteredUnitQuantityPrecision: 0,
}

describe('manual receipt snapshot units', () => {
  it('defaults to request packaging without live conversions', () => {
    expect(getDefaultReceiptUnit(line)).toBe('thung')
    expect(getReceiptUnit(line, 'thung')).toEqual({ factor: 24, name: 'Thùng', precision: 0 })
    expect(getReceiptUnit(line, 'lon').factor).toBe(1)
  })
  it('falls back to base unit for a partial package, never rounds the remaining quantity', () => {
    expect(getDefaultReceiptUnit({ ...line, remainingQuantity: 25 })).toBe('lon')
  })
})
