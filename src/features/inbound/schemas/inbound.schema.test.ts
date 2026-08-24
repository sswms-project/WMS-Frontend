import { describe, expect, it } from 'vitest'
import { inboundReceiptSchema, putawaySchema } from './inbound.schema'

const purchaseOrderId = '497f6eca-6276-4993-bfeb-53cbbbba6f08'
const purchaseOrderLineId = '2f1c1571-72fd-4c63-a05f-8f96ef70ecb4'
const receiptItemId = 'b85dbe37-5a0a-4f51-b638-8de737e59877'
const slotId = '5a44ce52-e867-4c26-4163-070d23ae2b4e'

describe('inbound schemas', () => {
  it('requires an exception reason when damaged goods are recorded', () => {
    const result = inboundReceiptSchema.safeParse({
      purchaseOrderId,
      lines: [
        { poLineId: purchaseOrderLineId, receivedQty: 5, damagedQty: 1, exceptionReason: '' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects damaged quantity above received quantity', () => {
    const result = inboundReceiptSchema.safeParse({
      purchaseOrderId,
      lines: [
        {
          poLineId: purchaseOrderLineId,
          receivedQty: 2,
          damagedQty: 3,
          exceptionReason: 'Rách bao bì',
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('accepts a positive put-away allocation', () => {
    expect(
      putawaySchema.safeParse({
        lines: [{ inboundReceiptItemId: receiptItemId, slotId, quantity: 2 }],
      }).success
    ).toBe(true)
    expect(
      putawaySchema.safeParse({
        lines: [{ inboundReceiptItemId: receiptItemId, slotId, quantity: 0 }],
      }).success
    ).toBe(false)
  })

  it('rejects duplicate allocation of one receipt item to the same slot', () => {
    const result = putawaySchema.safeParse({
      lines: [
        { inboundReceiptItemId: receiptItemId, slotId, quantity: 1 },
        { inboundReceiptItemId: receiptItemId, slotId, quantity: 2 },
      ],
    })

    expect(result.success).toBe(false)
  })
})
