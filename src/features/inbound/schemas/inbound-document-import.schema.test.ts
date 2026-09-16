import { describe, expect, it } from 'vitest'
import {
  inboundDocumentFileSchema,
  inboundDocumentReviewSchema,
} from './inbound-document-import.schema'

const GUID_A = '10000000-0000-4000-8000-000000000001'
const GUID_B = '10000000-0000-4000-8000-000000000002'

describe('inbound document import schemas', () => {
  it('accepts a supported document and rejects unsupported or oversized files', () => {
    expect(inboundDocumentFileSchema.safeParse(new File(['sku,qty'], 'delivery.csv')).success).toBe(
      true
    )
    expect(inboundDocumentFileSchema.safeParse(new File(['content'], 'delivery.exe')).success).toBe(
      false
    )
    expect(
      inboundDocumentFileSchema.safeParse(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'delivery.pdf')
      ).success
    ).toBe(false)
  })

  it('requires a reason for damaged goods and rejects damage above confirmed quantity', () => {
    const base = {
      purchaseOrderId: GUID_A,
      acknowledgeWarehouseMismatch: false,
      lines: [
        {
          sourceLineNumber: 1,
          purchaseOrderItemId: GUID_B,
          confirmedQuantity: 4,
          damagedQuantity: 1,
          exceptionReason: '',
          isLotTracked: false,
          lotNumber: '',
          manufacturedDate: '',
          expiryDate: '',
        },
      ],
    }

    expect(inboundDocumentReviewSchema.safeParse(base).success).toBe(false)
    expect(
      inboundDocumentReviewSchema.safeParse({
        ...base,
        lines: [{ ...base.lines[0], damagedQuantity: 5, exceptionReason: 'Vỡ thùng' }],
      }).success
    ).toBe(false)
    expect(
      inboundDocumentReviewSchema.safeParse({
        ...base,
        lines: [{ ...base.lines[0], exceptionReason: 'Vỡ thùng' }],
      }).success
    ).toBe(true)
  })

  it('does not allow two document rows to target the same purchase order line', () => {
    const line = {
      sourceLineNumber: 1,
      purchaseOrderItemId: GUID_B,
      confirmedQuantity: 1,
      damagedQuantity: 0,
      exceptionReason: '',
      isLotTracked: false,
      lotNumber: '',
      manufacturedDate: '',
      expiryDate: '',
    }

    expect(
      inboundDocumentReviewSchema.safeParse({
        purchaseOrderId: GUID_A,
        acknowledgeWarehouseMismatch: false,
        lines: [line, { ...line, sourceLineNumber: 2 }],
      }).success
    ).toBe(false)
  })
})
