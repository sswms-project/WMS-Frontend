import { describe, expect, it } from 'vitest'
import {
  createStockIssueRequestSchema,
  recordStockPickingSchema,
  createGoodsReturnRequestSchema,
} from './stock-issue.schema'

const one = '00000000-0000-0000-0000-000000000001'
const two = '00000000-0000-0000-0000-000000000002'

describe('outbound schemas', () => {
  it('rejects duplicate products and non-positive order quantities', () => {
    const line = { productId: one, quantity: 1 }
    expect(
      createStockIssueRequestSchema.safeParse({
        stockRecipientId: one,
        warehouseId: two,
        purpose: '',
        lines: [line, line],
      }).success
    ).toBe(false)
    expect(
      createStockIssueRequestSchema.safeParse({
        stockRecipientId: one,
        warehouseId: two,
        purpose: '',
        lines: [{ ...line, quantity: 0 }],
      }).success
    ).toBe(false)
  })

  it('supports partial issue but rejects quantity beyond remaining', () => {
    const base = {
      stockIssueRequestItemId: one,
      productId: one,
      productName: 'A',
      sku: 'A',
      remainingQuantity: 5,
      inventoryStockId: two,
      availableQuantity: 5,
    }
    expect(
      recordStockPickingSchema.safeParse({ lines: [{ ...base, pickedQuantity: 3 }] }).success
    ).toBe(true)
    expect(
      recordStockPickingSchema.safeParse({ lines: [{ ...base, pickedQuantity: 6 }] }).success
    ).toBe(false)
  })

  it('requires a restock slot for every condition except scrap', () => {
    const base = {
      stockIssuePickDetailId: one,
      productName: 'A',
      lotNumber: null,
      returnableQuantity: 1,
      quantity: 1,
      condition: 'Good' as const,
      restockSlotId: '',
    }
    expect(
      createGoodsReturnRequestSchema.safeParse({ reason: 'Hoàn', lines: [base] }).success
    ).toBe(false)
    expect(
      createGoodsReturnRequestSchema.safeParse({
        reason: 'Hoàn',
        lines: [{ ...base, restockSlotId: two }],
      }).success
    ).toBe(true)
    expect(
      createGoodsReturnRequestSchema.safeParse({
        reason: 'Hoàn',
        lines: [{ ...base, condition: 'Damaged', restockSlotId: '' }],
      }).success
    ).toBe(false)
    expect(
      createGoodsReturnRequestSchema.safeParse({
        reason: 'Hoàn',
        lines: [{ ...base, condition: 'Scrap', restockSlotId: '' }],
      }).success
    ).toBe(true)
  })
})
