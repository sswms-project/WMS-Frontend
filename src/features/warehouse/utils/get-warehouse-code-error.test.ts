import { describe, expect, it } from 'vitest'
import { getWarehouseCodeError } from './get-warehouse-code-error'

describe('getWarehouseCodeError', () => {
  it('maps backend warehouse-code validation errors regardless of casing', () => {
    expect(
      getWarehouseCodeError({
        statusCode: 400,
        message: 'Validation failed.',
        errors: { WarehouseCode: ['Mã kho không hợp lệ.'] },
      })
    ).toBe('Mã kho không hợp lệ.')

    expect(
      getWarehouseCodeError({
        statusCode: 400,
        message: 'Validation failed.',
        errors: { warehouseCode: ['Mã kho không hợp lệ.'] },
      })
    ).toBe('Mã kho không hợp lệ.')
  })

  it('maps duplicate code conflicts to the warehouse-code field', () => {
    expect(
      getWarehouseCodeError({
        statusCode: 409,
        message: 'Warehouse already exists.',
      })
    ).toBe('Mã kho đã tồn tại. Vui lòng chọn mã khác.')
  })
})
