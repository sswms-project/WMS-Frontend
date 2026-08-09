import { describe, expect, it } from 'vitest'
import { createWarehouseSchema, updateWarehouseSchema } from './warehouse.schema'

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
})
