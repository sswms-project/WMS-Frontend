import { describe, expect, it } from 'vitest'
import { goodsReceiptSchema, putawaySchema } from './inbound.schema'

const inboundRequestId = '497f6eca-6276-4993-bfeb-53cbbbba6f08'
const inboundRequestLineId = '2f1c1571-72fd-4c63-a05f-8f96ef70ecb4'
const receiptItemId = 'b85dbe37-5a0a-4f51-b638-8de737e59877'
const slotId = '5a44ce52-e867-4c26-4163-070d23ae2b4e'

describe('inbound schemas', () => {
  it('requires an exception reason when damaged goods are recorded', () => {
    const result = goodsReceiptSchema.safeParse({
      inboundRequestId,
      lines: [
        {
          inboundRequestItemId: inboundRequestLineId,
          receivedQty: 5,
          damagedQty: 1,
          exceptionReason: '',
          isLotTracked: false,
          lotNumber: '',
          manufacturedDate: '',
          expiryDate: '',
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects damaged quantity above received quantity', () => {
    const result = goodsReceiptSchema.safeParse({
      inboundRequestId,
      lines: [
        {
          inboundRequestItemId: inboundRequestLineId,
          receivedQty: 2,
          damagedQty: 3,
          exceptionReason: 'Rách bao bì',
          isLotTracked: false,
          lotNumber: '',
          manufacturedDate: '',
          expiryDate: '',
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('requires a lot number and validates lot dates for lot-tracked products', () => {
    const base = {
      inboundRequestItemId: inboundRequestLineId,
      receivedQty: 2,
      damagedQty: 0,
      exceptionReason: '',
      isLotTracked: true,
      lotNumber: '',
      manufacturedDate: '2026-09-10',
      expiryDate: '2026-09-09',
    }
    expect(goodsReceiptSchema.safeParse({ inboundRequestId, lines: [base] }).success).toBe(false)
    expect(
      goodsReceiptSchema.safeParse({
        inboundRequestId,
        lines: [{ ...base, lotNumber: 'LOT-01', expiryDate: '2026-09-11' }],
      }).success
    ).toBe(true)
  })

  it('accepts a positive put-away allocation', () => {
    expect(
      putawaySchema.safeParse({
        lines: [{ goodsReceiptItemId: receiptItemId, slotId, quantity: 2 }],
      }).success
    ).toBe(true)
    expect(
      putawaySchema.safeParse({
        lines: [{ goodsReceiptItemId: receiptItemId, slotId, quantity: 0 }],
      }).success
    ).toBe(false)
  })

  it('rejects duplicate allocation of one receipt item to the same slot', () => {
    const result = putawaySchema.safeParse({
      lines: [
        { goodsReceiptItemId: receiptItemId, slotId, quantity: 1 },
        { goodsReceiptItemId: receiptItemId, slotId, quantity: 2 },
      ],
    })

    expect(result.success).toBe(false)
  })
})
