import { describe, expect, it } from 'vitest'
import type { LocationSearchResponse } from '@/features/warehouse/types/warehouse.types'
import type { TransferReceiveSheet } from '../types/transfer.types'
import {
  dispatchedInEnteredUnit,
  emptyTransferForm,
  toSaveDraftRequest,
  toUpdateTransferRequest,
  transferToFormValues,
  visibleTransferItems,
} from './transfer-form'
import {
  buildExpectedReceiptQuantities,
  buildInitialReceiptEntries,
  findReceivableSlot,
  toReceiveRequest,
} from './transfer-receive'
import { buildTransfer, buildTransferItem } from './transfer-test-fixtures'

describe('transfer form conversion', () => {
  it('starts with one empty line', () => {
    expect(emptyTransferForm().lines).toHaveLength(1)
  })

  it('hides lines that were removed after dispatch but keeps shipped lines', () => {
    const removed = buildTransferItem({ id: 'removed', quantity: 0, dispatchedQuantity: 0 })
    const shipped = buildTransferItem({ id: 'shipped', quantity: 0, dispatchedQuantity: 3 })
    const active = buildTransferItem({ id: 'active' })
    expect(visibleTransferItems([removed, shipped, active]).map((item) => item.id)).toEqual([
      'shipped',
      'active',
    ])
  })

  it('maps a detail to form values using the entered unit and quantity', () => {
    const detail = buildTransfer({
      reason: 'Bổ sung hàng',
      requiredBy: '2026-10-20T16:59:59.999Z',
      items: [
        buildTransferItem({
          unitId: 'unit-box',
          requestedQuantity: 2,
          quantity: 24,
          conversionFactor: 12,
        }),
      ],
    })
    const values = transferToFormValues(detail)
    expect(values.reason).toBe('Bổ sung hàng')
    expect(values.requiredBy).toBe('2026-10-20')
    expect(values.lines[0]).toMatchObject({ unitId: 'unit-box', quantity: 2 })
  })

  it('converts the shipped base quantity back to the entered unit', () => {
    expect(dispatchedInEnteredUnit({ dispatchedQuantity: 24, conversionFactor: 12 })).toBe(2)
    expect(dispatchedInEnteredUnit({ dispatchedQuantity: 5, conversionFactor: 0 })).toBe(5)
  })

  it('builds the draft request with null for blank optional text and unit', () => {
    const values = emptyTransferForm()
    values.sourceWarehouseId = 'a'
    values.destinationWarehouseId = 'b'
    values.lines = [{ itemId: null, productId: 'p', unitId: '', quantity: 3 }]
    expect(toSaveDraftRequest(values, 'v1')).toEqual({
      expectedVersion: 'v1',
      sourceWarehouseId: 'a',
      destinationWarehouseId: 'b',
      reason: null,
      requiredBy: null,
      note: null,
      items: [{ itemId: null, productId: 'p', unitId: null, quantity: 3 }],
    })
  })

  it('sends warehouses on update only when they changed', () => {
    const detail = buildTransfer()
    const values = transferToFormValues(detail)
    const unchanged = toUpdateTransferRequest(values, detail, 'v2')
    expect(unchanged.sourceWarehouseId).toBeNull()
    expect(unchanged.destinationWarehouseId).toBeNull()
    expect(unchanged.expectedVersion).toBe('v2')
    const changed = toUpdateTransferRequest(
      { ...values, destinationWarehouseId: 'new' },
      detail,
      'v2'
    )
    expect(changed.destinationWarehouseId).toBe('new')
  })

  it('stamps the required-by date at the end of the Vietnam business day', () => {
    const values = { ...emptyTransferForm(), requiredBy: '2026-10-20' }
    expect(toSaveDraftRequest(values, null).requiredBy).toBe('2026-10-20T23:59:59.999+07:00')
  })
})

const sheet: TransferReceiveSheet = {
  shipmentId: 's1',
  shipmentNumber: 1,
  transferId: 't1',
  transferCode: 'DC-0001',
  destinationWarehouseId: 'w2',
  destinationWarehouseName: 'Kho B',
  shipmentStatus: 'InTransit',
  version: 'v9',
  lines: [
    {
      lineId: 'l1',
      itemId: 'i1',
      productId: 'p1',
      sku: 'SKU-001',
      productName: 'Sữa tươi',
      productBarcode: null,
      baseUnitName: 'Hộp',
      suggestedSlotId: null,
      suggestedSlotCode: null,
      lots: [
        {
          lotId: 'lot-1',
          lotNumber: 'L1',
          expiryDate: '2027-01-01',
          dispatchedQuantity: 6,
          receivedQuantity: 0,
        },
        {
          lotId: null,
          lotNumber: null,
          expiryDate: null,
          dispatchedQuantity: 4,
          receivedQuantity: 0,
        },
      ],
    },
  ],
}

describe('receive helpers', () => {
  it('creates one fully-good entry per line and lot', () => {
    const entries = buildInitialReceiptEntries(sheet)
    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({
      lineId: 'l1',
      lotId: 'lot-1',
      goodQuantity: 6,
      damagedQuantity: 0,
      missingQuantity: 0,
    })
    expect(entries[1]).toMatchObject({ lotId: null, goodQuantity: 4 })
    expect(buildExpectedReceiptQuantities(sheet).get('l1|lot-1')).toBe(6)
    expect(buildExpectedReceiptQuantities(sheet).get('l1|')).toBe(4)
  })

  it('builds the receipt request with nulls for blank optional fields', () => {
    const entries = buildInitialReceiptEntries(sheet)
    entries[0] = { ...entries[0]!, destinationSlotId: 'slot-1', scannedSlotCode: 'B-01' }
    const request = toReceiveRequest({ entries }, 'v9')
    expect(request.expectedVersion).toBe('v9')
    expect(request.entries[0]).toMatchObject({
      destinationSlotId: 'slot-1',
      scannedSlotCode: 'B-01',
      reasonCode: null,
      note: null,
      scannedProductCode: null,
    })
  })

  it('only resolves active, non-staging slots by code or barcode', () => {
    const slot = (overrides: Partial<LocationSearchResponse>) =>
      ({
        id: 'x',
        type: 'Slot',
        code: 'B-01',
        barcodeValue: 'BAR-B-01',
        lifecycleStatus: 'Active',
        isOutboundStaging: false,
        ...overrides,
      }) as LocationSearchResponse
    expect(findReceivableSlot('b-01', [slot({ id: 'a' })])?.id).toBe('a')
    expect(findReceivableSlot('bar-b-01', [slot({ id: 'a' })])?.id).toBe('a')
    expect(findReceivableSlot('B-01', [slot({ isOutboundStaging: true })])).toBeNull()
    expect(findReceivableSlot('B-01', [slot({ lifecycleStatus: 'Inactive' })])).toBeNull()
    expect(findReceivableSlot('B-01', [slot({ type: 'Rack' })])).toBeNull()
    expect(findReceivableSlot('', [slot({})])).toBeNull()
  })
})
