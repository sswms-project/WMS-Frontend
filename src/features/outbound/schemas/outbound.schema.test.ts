import { describe, expect, it } from 'vitest'
import { createOutboundOrderSchema, issueStockSchema, recordReturnSchema } from './outbound.schema'

const one = '00000000-0000-0000-0000-000000000001'
const two = '00000000-0000-0000-0000-000000000002'

describe('outbound schemas', () => {
  it('rejects duplicate products and non-positive order quantities', () => {
    const line = { productId: one, quantity: 1 }
    expect(
      createOutboundOrderSchema.safeParse({
        customerId: one,
        warehouseId: two,
        purpose: '',
        lines: [line, line],
      }).success
    ).toBe(false)
    expect(
      createOutboundOrderSchema.safeParse({
        customerId: one,
        warehouseId: two,
        purpose: '',
        lines: [{ ...line, quantity: 0 }],
      }).success
    ).toBe(false)
  })

  it('supports partial issue but rejects quantity beyond remaining', () => {
    const base = {
      outboundOrderItemId: one,
      productId: one,
      productName: 'A',
      sku: 'A',
      remainingQuantity: 5,
      sourceSlotId: two,
    }
    expect(issueStockSchema.safeParse({ lines: [{ ...base, pickedQuantity: 3 }] }).success).toBe(
      true
    )
    expect(issueStockSchema.safeParse({ lines: [{ ...base, pickedQuantity: 6 }] }).success).toBe(
      false
    )
  })

  it('requires a restock slot only for selected good stock', () => {
    const base = { productId: one, quantity: 1, condition: 'Good' as const, restockSlotId: '' }
    expect(recordReturnSchema.safeParse({ reason: 'Hoàn', lines: [base] }).success).toBe(false)
    expect(
      recordReturnSchema.safeParse({ reason: 'Hoàn', lines: [{ ...base, restockSlotId: two }] })
        .success
    ).toBe(true)
    expect(
      recordReturnSchema.safeParse({
        reason: 'Hoàn',
        lines: [{ ...base, condition: 'Damaged', restockSlotId: '' }],
      }).success
    ).toBe(true)
  })
})
