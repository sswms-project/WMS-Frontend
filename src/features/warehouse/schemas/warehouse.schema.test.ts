import { describe, expect, it } from 'vitest'
import { zoneSchema } from './warehouse.schema'

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

  it('rejects a unit without its physical value', () => {
    const result = zoneSchema.safeParse({
      ...validZone,
      physicalHeight: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['physicalHeight'] })
      )
    }
  })
})
