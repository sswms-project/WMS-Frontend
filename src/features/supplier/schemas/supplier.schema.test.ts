import { describe, expect, it } from 'vitest'
import { saveSupplierSchema } from './supplier.schema'

describe('saveSupplierSchema', () => {
  it('requires the supplier code and name but allows contact fields to be empty', () => {
    expect(
      saveSupplierSchema.safeParse({
        supplierCode: 'NCC0001',
        supplierName: 'Nhà cung cấp A',
        phone: '',
        email: '',
        address: '',
      }).success
    ).toBe(true)
    expect(
      saveSupplierSchema.safeParse({
        supplierCode: '',
        supplierName: '',
        phone: '',
        email: '',
        address: '',
      }).success
    ).toBe(false)
  })

  it('rejects malformed email values', () => {
    expect(
      saveSupplierSchema.safeParse({
        supplierCode: 'NCC0001',
        supplierName: 'Nhà cung cấp A',
        phone: '',
        email: 'invalid',
        address: '',
      }).success
    ).toBe(false)
  })
})
