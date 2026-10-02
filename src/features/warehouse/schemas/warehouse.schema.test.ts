import { describe, expect, it } from 'vitest'
import { rackSchema, slotSchema, zoneSchema } from './warehouse.schema'
import { EMPTY_WAREHOUSE_PHYSICAL_DETAILS } from '../utils/warehouse-physical-details'

const validZone = {
  zoneCode: 'ZONE-A',
  zoneName: 'Khu vực A',
  description: '',
  storageCapacity: 1_000,
  storageCapacityUnit: 'Kilogram' as const,
  physicalLength: 12,
  physicalLengthUnit: 'Meter' as const,
  physicalWidth: 8,
  physicalWidthUnit: 'Meter' as const,
  physicalHeight: 4,
  physicalHeightUnit: 'Meter' as const,
}

describe('warehouse location physical details', () => {
  it('accepts complete capacity and dimension pairs', () => {
    expect(zoneSchema.safeParse(validZone).success).toBe(true)
  })

  it('rejects a physical value without its unit', () => {
    const result = zoneSchema.safeParse({
      ...validZone,
      storageCapacityUnit: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['storageCapacityUnit'] })
      )
    }
  })

  it('ignores a selected dimension unit without its optional physical value', () => {
    const result = zoneSchema.safeParse({
      ...validZone,
      physicalHeight: null,
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.physicalHeightUnit).toBeNull()
  })
})

const slot = {
  slotCode: 'A01',
  slotName: 'Vị trí A01',
  description: '',
  allowsMixedProducts: true,
  capacityType: 'None',
  capacity: null,
  capacityUnitId: null,
  ...EMPTY_WAREHOUSE_PHYSICAL_DETAILS,
}
const quantity = {
  capacityType: 'Quantity',
  capacity: 20,
  capacityUnitId: '10000000-0000-4000-8000-000000000001',
}

describe('quantity storage capacity contracts', () => {
  it.each(['Kilometer', 'Meter', 'Decimeter', 'Centimeter'])(
    'clears unused %s dimensions on rack and slot payloads',
    (unit) => {
      const dimensions = {
        physicalLengthUnit: unit,
        physicalWidthUnit: unit,
        physicalHeightUnit: unit,
      }
      const results = [
        slotSchema.parse({ ...slot, ...dimensions }),
        rackSchema.parse({
          ...slot,
          ...dimensions,
          rackCode: 'R',
          rackName: 'Rack',
          storageMode: 'RackLevel',
        }),
      ]
      for (const result of results) {
        expect(result.physicalLengthUnit).toBeNull()
        expect(result.physicalWidthUnit).toBeNull()
        expect(result.physicalHeightUnit).toBeNull()
      }
    }
  )
  it('accepts seeded .NET GUID unit IDs on rack and slot forms', () => {
    const policy = { ...quantity, capacityUnitId: '09dcfa34-643a-b355-d8b0-45a0f0caadbf' }
    expect(slotSchema.safeParse({ ...slot, ...policy }).success).toBe(true)
    expect(
      rackSchema.safeParse({
        ...slot,
        ...policy,
        rackCode: 'R01',
        rackName: 'Kệ',
        storageMode: 'RackLevel',
      }).success
    ).toBe(true)
    expect(
      slotSchema.safeParse({
        ...slot,
        ...policy,
        capacityUnitId: '00000000-0000-0000-0000-000000000000',
      }).success
    ).toBe(false)
  })
  it('accepts unlimited and quantity policies for single and mixed SKU slots', () => {
    for (const allowsMixedProducts of [false, true]) {
      expect(slotSchema.safeParse({ ...slot, allowsMixedProducts }).success).toBe(true)
      expect(slotSchema.safeParse({ ...slot, ...quantity, allowsMixedProducts }).success).toBe(true)
    }
  })
  it.each([
    { capacity: null },
    { capacity: 0 },
    { capacity: -1 },
    { capacityUnitId: null },
    { capacityUnitId: 'invalid' },
  ])('rejects incomplete Quantity policy %o', (invalid) => {
    expect(slotSchema.safeParse({ ...slot, ...quantity, ...invalid }).success).toBe(false)
  })
  it.each([{ capacity: 20 }, { capacityUnitId: quantity.capacityUnitId }])(
    'requires cleared fields for None %o',
    (invalid) => {
      expect(slotSchema.safeParse({ ...slot, ...invalid }).success).toBe(false)
    }
  )
  it('supports RackLevel but rejects Quantity on a SlotLevel container', () => {
    const rack = {
      ...slot,
      ...quantity,
      rackCode: 'R01',
      rackName: 'Kệ 1',
      storageMode: 'RackLevel',
    }
    expect(rackSchema.safeParse(rack).success).toBe(true)
    expect(rackSchema.safeParse({ ...rack, storageMode: 'SlotLevel' }).success).toBe(false)
    expect(
      rackSchema.safeParse({
        ...rack,
        storageMode: 'SlotLevel',
        capacityType: 'None',
        capacity: null,
        capacityUnitId: null,
      }).success
    ).toBe(true)
  })
})
