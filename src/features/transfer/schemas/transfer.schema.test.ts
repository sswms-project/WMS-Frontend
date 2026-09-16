import { describe, expect, it } from 'vitest'
import {
  approveTransferSchema,
  createTransferSchema,
  receiveTransferSchema,
} from './transfer.schema'

const ids = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
]

describe('transfer schemas', () => {
  it('rejects equal warehouses and duplicate source inventory', () => {
    const line = {
      productId: ids[1],
      sourceInventoryStockId: ids[1],
      sourceSlotId: ids[2],
      destinationSlotId: ids[3],
      lotId: null,
      availableQuantity: 5,
      quantity: 1,
    }
    expect(
      createTransferSchema.safeParse({
        sourceWarehouseId: ids[0],
        destinationWarehouseId: ids[0],
        lines: [line, line],
      }).success
    ).toBe(false)
  })

  it('accepts an exact lot-tracked source inventory row within availability', () => {
    expect(
      createTransferSchema.safeParse({
        sourceWarehouseId: ids[0],
        destinationWarehouseId: ids[1],
        lines: [
          {
            productId: ids[1],
            sourceInventoryStockId: ids[2],
            sourceSlotId: ids[2],
            destinationSlotId: ids[3],
            lotId: ids[3],
            availableQuantity: 5,
            quantity: 4,
          },
        ],
      }).success
    ).toBe(true)
  })

  it('limits approved quantity to the requested quantity', () => {
    expect(
      approveTransferSchema.safeParse({
        note: '',
        lines: [
          {
            stockTransferItemId: ids[0],
            productName: 'A',
            requestedQuantity: 5,
            approvedQuantity: 6,
          },
        ],
      }).success
    ).toBe(false)
    expect(
      approveTransferSchema.safeParse({
        note: '',
        lines: [
          {
            stockTransferItemId: ids[0],
            productName: 'A',
            requestedQuantity: 5,
            approvedQuantity: 3,
          },
        ],
      }).success
    ).toBe(true)
  })

  it('requires received, damaged and missing to equal dispatched', () => {
    const line = {
      stockTransferItemId: ids[0],
      productName: 'A',
      dispatchedQuantity: 5,
      receivedQuantity: 3,
      damagedQuantity: 1,
      missingQuantity: 0,
    }
    expect(receiveTransferSchema.safeParse({ lines: [line] }).success).toBe(false)
    expect(
      receiveTransferSchema.safeParse({ lines: [{ ...line, missingQuantity: 1 }] }).success
    ).toBe(true)
  })
})
