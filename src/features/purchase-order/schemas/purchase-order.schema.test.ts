import { describe, expect, it } from 'vitest'
import { purchaseOrderSchema, rejectionSchema } from './purchase-order.schema'

const warehouseId = '327e070f-f2e8-4070-4163-08def752f423'
const supplierId = '2f1c1571-72fd-4c63-a05f-8f96ef70ecb4'
const productId = 'b85dbe37-5a0a-4f51-b638-8de737e59877'

describe('purchase order schema', () => {
  it('accepts a valid draft containing a non-RFC .NET Guid', () => {
    expect(
      purchaseOrderSchema.safeParse({
        warehouseId,
        supplierId,
        expectedDate: '',
        lines: [{ productId, quantity: 5, unitPrice: 12000 }],
      }).success
    ).toBe(true)
  })

  it('rejects duplicate products and non-positive quantities', () => {
    const result = purchaseOrderSchema.safeParse({
      warehouseId,
      supplierId,
      expectedDate: '',
      lines: [
        { productId, quantity: 0, unitPrice: null },
        { productId, quantity: 2, unitPrice: null },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('requires a trimmed rejection reason within 500 characters', () => {
    expect(rejectionSchema.safeParse({ reason: '   ' }).success).toBe(false)
    expect(rejectionSchema.safeParse({ reason: 'Cần kiểm tra lại đơn giá.' }).success).toBe(true)
    expect(rejectionSchema.safeParse({ reason: 'a'.repeat(501) }).success).toBe(false)
  })
})
