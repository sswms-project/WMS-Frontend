import { describe, expect, it } from 'vitest'
import type { LocationSearchResponse } from '@/features/warehouse/types/warehouse.types'
import type { ZoneResponse } from '@/types/warehouse'
import { findRackLevelSlot, findReceivableSlot } from './transfer-receive'

const slot = (overrides: Partial<LocationSearchResponse>) =>
  ({
    id: 'slot-1',
    type: 'Slot',
    code: 'C1-02',
    barcodeValue: 'BC-C1-02',
    lifecycleStatus: 'Active',
    isOutboundStaging: false,
    ...overrides,
  }) as LocationSearchResponse

const zones = (rackOverrides: Record<string, unknown> = {}): ZoneResponse[] =>
  [
    {
      id: 'z1',
      zoneCode: 'Z1',
      status: 'Active',
      racks: [
        {
          id: 'r1',
          rackCode: 'A07',
          status: 'Active',
          storageMode: 'RackLevel',
          defaultSlotId: 'default-a07',
          slots: [],
          ...rackOverrides,
        },
      ],
    },
  ] as unknown as ZoneResponse[]

describe('findReceivableSlot', () => {
  it('returns the id and code of an active slot matched by code or barcode', () => {
    expect(findReceivableSlot(' c1-02 ', [slot({})])).toEqual({ id: 'slot-1', code: 'C1-02' })
    expect(findReceivableSlot('bc-c1-02', [slot({})])?.id).toBe('slot-1')
  })

  it('ignores outbound staging, inactive slots and other location types', () => {
    expect(findReceivableSlot('C1-02', [slot({ isOutboundStaging: true })])).toBeNull()
    expect(findReceivableSlot('C1-02', [slot({ lifecycleStatus: 'Inactive' as never })])).toBeNull()
    expect(findReceivableSlot('C1-02', [slot({ type: 'Rack' as never })])).toBeNull()
    expect(findReceivableSlot('  ', [slot({})])).toBeNull()
  })
})

describe('findRackLevelSlot', () => {
  it('resolves a scanned rack code to the default slot of a rack-level rack', () => {
    expect(findRackLevelSlot(' a07 ', zones())).toEqual({ id: 'default-a07', code: 'A07' })
  })

  it('does not resolve slot-level, inactive or default-less racks', () => {
    expect(findRackLevelSlot('A07', zones({ storageMode: 'SlotLevel' }))).toBeNull()
    expect(findRackLevelSlot('A07', zones({ status: 'Inactive' }))).toBeNull()
    expect(findRackLevelSlot('A07', zones({ defaultSlotId: null }))).toBeNull()
    expect(findRackLevelSlot('B09', zones())).toBeNull()
  })
})
