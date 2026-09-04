import { describe, expect, it } from 'vitest'
import {
  createStaffWarehouseFormSchema,
  updateStaffWarehousesSchema,
} from './update-staff-warehouses.schema'

const first = 'aaaaaaaa-1111-1111-1111-111111111111'
const second = 'bbbbbbbb-2222-2222-2222-222222222222'
const valid = { warehouseIds: [first], expectedWarehouseIds: [], replacements: [] }

describe('Update staff warehouses contract', () => {
  it('accepts a valid replacement and empty manager assignments', () => {
    expect(
      updateStaffWarehousesSchema.safeParse({
        ...valid,
        replacements: [{ warehouseId: first, managerId: second }],
      }).success
    ).toBe(true)
    expect(
      createStaffWarehouseFormSchema(true, []).safeParse({ ...valid, warehouseIds: [] }).success
    ).toBe(true)
  })

  it.each([
    { warehouseIds: null },
    { expectedWarehouseIds: null },
    { replacements: null },
    { warehouseIds: ['not-a-guid'] },
    { warehouseIds: ['00000000-0000-0000-0000-000000000000'] },
    { warehouseIds: [first, first.toUpperCase()] },
    { expectedWarehouseIds: [second, second] },
    { replacements: [{ warehouseId: first, managerId: 'invalid' }] },
    {
      replacements: [
        { warehouseId: first, managerId: second },
        { warehouseId: first.toUpperCase(), managerId: second },
      ],
    },
  ])('rejects invalid command fields: %j', (fields) => {
    expect(updateStaffWarehousesSchema.safeParse({ ...valid, ...fields }).success).toBe(false)
  })

  it('requires at least one active warehouse for staff', () => {
    expect(createStaffWarehouseFormSchema(false, [first]).safeParse(valid).success).toBe(true)
    expect(createStaffWarehouseFormSchema(false, [second]).safeParse(valid).success).toBe(false)
    expect(
      createStaffWarehouseFormSchema(false, [first]).safeParse({ ...valid, warehouseIds: [] })
        .success
    ).toBe(false)
  })
})
