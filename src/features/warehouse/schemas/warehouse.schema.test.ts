import { describe, expect, it } from 'vitest'
import {
  createWarehouseSchema,
  rackSchema,
  slotSchema,
  updateWarehouseSchema,
  zoneSchema,
} from './warehouse.schema'

describe('createWarehouseSchema', () => {
  it('trims a valid warehouse payload supported by the API', () => {
    expect(
      createWarehouseSchema.parse({
        warehouseCode: '  HCM-01  ',
        warehouseName: '  Kho Thu Duc  ',
        address: '  Thu Duc, Ho Chi Minh City  ',
      })
    ).toEqual({
      warehouseCode: 'HCM-01',
      warehouseName: 'Kho Thu Duc',
      address: 'Thu Duc, Ho Chi Minh City',
    })
  })

  it('rejects a missing warehouse code', () => {
    expect(
      createWarehouseSchema.safeParse({
        warehouseCode: '   ',
        warehouseName: 'Kho Thu Duc',
        address: '',
      }).success
    ).toBe(false)
  })

  it('rejects names longer than the backend limit', () => {
    expect(
      createWarehouseSchema.safeParse({
        warehouseCode: 'HCM-01',
        warehouseName: 'a'.repeat(256),
        address: '',
      }).success
    ).toBe(false)
  })

  it('rejects warehouse codes longer than 50 characters', () => {
    expect(
      createWarehouseSchema.safeParse({
        warehouseCode: 'W'.repeat(51),
        warehouseName: 'Kho Thu Duc',
        address: '',
      }).success
    ).toBe(false)
  })

  it('allows an empty optional address and rejects an address longer than 500 characters', () => {
    expect(
      createWarehouseSchema.safeParse({
        warehouseCode: 'HCM-01',
        warehouseName: 'Kho Thu Duc',
        address: '   ',
      }).success
    ).toBe(true)

    expect(
      createWarehouseSchema.safeParse({
        warehouseCode: 'HCM-01',
        warehouseName: 'Kho Thu Duc',
        address: 'A'.repeat(501),
      }).success
    ).toBe(false)
  })
})

describe('updateWarehouseSchema', () => {
  it('does not expose warehouse code as an editable field', () => {
    expect(
      updateWarehouseSchema.parse({
        warehouseName: 'Kho Thu Duc',
        address: 'Thu Duc, Ho Chi Minh City',
      })
    ).toEqual({
      warehouseName: 'Kho Thu Duc',
      address: 'Thu Duc, Ho Chi Minh City',
    })
  })

  it('trims the editable fields and rejects whitespace-only warehouse names', () => {
    expect(
      updateWarehouseSchema.parse({
        warehouseName: '  Kho Thu Duc  ',
        address: '  Thu Duc  ',
      })
    ).toEqual({
      warehouseName: 'Kho Thu Duc',
      address: 'Thu Duc',
    })

    expect(updateWarehouseSchema.safeParse({ warehouseName: '   ', address: '' }).success).toBe(
      false
    )
  })
})

describe('warehouse structure schemas', () => {
  it('trims valid zone and rack values', () => {
    expect(
      zoneSchema.parse({ zoneCode: ' Z-01 ', zoneName: ' Khu nhận ', description: ' Mô tả ' })
    ).toEqual({
      zoneCode: 'Z-01',
      zoneName: 'Khu nhận',
      description: 'Mô tả',
    })
    expect(rackSchema.parse({ rackCode: ' R-01 ', rackName: ' Kệ 01 ' })).toEqual({
      rackCode: 'R-01',
      rackName: 'Kệ 01',
    })
  })

  it('rejects an empty slot code and non-positive capacity', () => {
    expect(slotSchema.safeParse({ slotCode: ' ', capacity: 10 }).success).toBe(false)
    expect(slotSchema.safeParse({ slotCode: 'S-01', capacity: 0 }).success).toBe(false)
  })
})
