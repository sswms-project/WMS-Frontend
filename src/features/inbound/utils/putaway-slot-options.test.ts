import { describe, expect, it } from 'vitest'
import type { SlotResponse, ZoneResponse } from '@/types/warehouse'
import type { GoodsReceiptItem } from '../types/inbound.types'
import { getPutawaySlotOptions } from './putaway-slot-options'
import { getPutawayAllocationState } from '../schemas/putaway-allocation.schema'

const slot: SlotResponse = {
  id: '10000000-0000-4000-8000-000000000001',
  slotCode: 'A01',
  slotName: 'A01',
  description: null,
  status: 'Vacant',
  isActive: true,
  capacityType: 'Quantity',
  capacity: 20,
  capacityUsed: 8,
  capacityUnitName: 'Thùng',
  remainingCapacity: 12,
  currentOccupancy: 192,
  barcodeValue: null,
}
const zone: ZoneResponse = {
  id: 'zone',
  zoneCode: 'ZA',
  zoneName: 'Khu A',
  description: null,
  status: 'Active',
  racks: [
    {
      id: 'rack',
      rackCode: 'R',
      rackName: 'Kệ',
      description: null,
      status: 'Active',
      storageMode: 'SlotLevel',
      slots: [slot],
    },
  ],
}
const item: GoodsReceiptItem = {
  id: '10000000-0000-4000-8000-000000000002',
  productId: 'product',
  productSKU: 'SKU',
  productName: 'Lon nước',
  inboundRequestItemId: 'request',
  lotId: null,
  lotNumber: null,
  manufacturedDate: null,
  expiryDate: null,
  orderedQuantity: 240,
  receivedQuantity: 240,
  damagedQuantity: 0,
  usableQuantity: 240,
  putAwayQuantity: 0,
  remainingPutAwayQuantity: 240,
  exceptionReason: null,
  putAwayDetails: [],
}

describe('putaway capacity units', () => {
  it('allows 240 base units to be submitted for BE conversion instead of comparing to 12 cartons', () => {
    const slots = getPutawaySlotOptions([zone])
    expect(slots[0]?.capacityLabel).toContain('8 / 20 Thùng')
    const allocation = getPutawayAllocationState(
      [{ goodsReceiptItemId: item.id, slotId: slot.id, quantity: 240 }],
      [item],
      slots
    )
    expect(allocation.canSubmit).toBe(true)
    expect(allocation.rows[0]?.maxQuantity).toBe(240)
  })
  it.each([
    { capacityType: 'Quantity' as const, remainingCapacity: 0, unavailableReason: 'Vị trí đã đầy' },
    {
      capacityType: 'None' as const,
      requiresCapacityConfiguration: true,
      unavailableReason: 'Cần cấu hình đơn vị sức chứa',
    },
  ])('indicates and rejects unavailable positions %o', ({ unavailableReason, ...policy }) => {
    const slots = getPutawaySlotOptions([
      { ...zone, racks: zone.racks.map((rack) => ({ ...rack, slots: [{ ...slot, ...policy }] })) },
    ])
    expect(slots[0]?.unavailableReason).toBe(unavailableReason)
    expect(
      getPutawayAllocationState(
        [{ goodsReceiptItemId: item.id, slotId: slot.id, quantity: 1 }],
        [item],
        slots
      ).canSubmit
    ).toBe(false)
  })
  it('lists RackLevel default slot once and excludes outbound and inactive slots', () => {
    const racks = zone.racks.map((rack) => ({
      ...rack,
      ...slot,
      status: 'Active',
      rackCode: 'R',
      rackName: 'Kệ',
      storageMode: 'RackLevel' as const,
      defaultSlotId: slot.id,
    }))
    expect(getPutawaySlotOptions([{ ...zone, racks }])).toHaveLength(1)
    expect(
      getPutawaySlotOptions([
        {
          ...zone,
          racks: zone.racks.map((rack) => ({
            ...rack,
            slots: [
              { ...slot, isOutboundStaging: true },
              { ...slot, id: 'inactive', isActive: false },
            ],
          })),
        },
      ])
    ).toEqual([])
  })
  it('still rejects over-allocation against receipt quantity and duplicate lines', () => {
    const slots = getPutawaySlotOptions([zone])
    expect(
      getPutawayAllocationState(
        [{ goodsReceiptItemId: item.id, slotId: slot.id, quantity: 241 }],
        [item],
        slots
      ).canSubmit
    ).toBe(false)
    const line = { goodsReceiptItemId: item.id, slotId: slot.id, quantity: 1 }
    expect(getPutawayAllocationState([line, line], [item], slots).canSubmit).toBe(false)
  })
})
