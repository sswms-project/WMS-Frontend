import { describe, expect, it } from 'vitest'
import { saveSupplierSchema } from './supplier.schema'

describe('saveSupplierSchema', () => {
  it('requires the supplier code and name but allows contact fields to be empty', () => {
    expect(
      saveSupplierSchema.safeParse({
        supplierCode: 'NCC000001',
        supplierName: 'Nhà cung cấp A',
        taxCode: '',
        phone: '',
        email: '',
        address: '',
        contactSalutation: '',
        contactName: '',
        contactEmail: '',
        contactMobile: '',
        contactChannel: '',
        contactChannelName: '',
      }).success
    ).toBe(true)
    expect(
      saveSupplierSchema.safeParse({
        supplierCode: '',
        supplierName: '',
        taxCode: '',
        phone: '',
        email: '',
        address: '',
        contactSalutation: '',
        contactName: '',
        contactEmail: '',
        contactMobile: '',
        contactChannel: '',
        contactChannelName: '',
      }).success
    ).toBe(false)
  })

  it('rejects malformed email values', () => {
    expect(
      saveSupplierSchema.safeParse({
        supplierCode: 'NCC000001',
        supplierName: 'Nhà cung cấp A',
        taxCode: '',
        phone: '',
        email: 'invalid',
        address: '',
        contactSalutation: '',
        contactName: '',
        contactEmail: '',
        contactMobile: '',
        contactChannel: '',
        contactChannelName: '',
      }).success
    ).toBe(false)
  })

  it('matches the API limit for the contact channel name', () => {
    const values = {
      supplierCode: 'NCC000001',
      supplierName: 'Nhà cung cấp A',
      taxCode: '',
      phone: '',
      email: '',
      address: '',
      contactSalutation: '',
      contactName: '',
      contactEmail: '',
      contactMobile: '',
      contactChannel: 'Zalo',
      contactChannelName: 'a'.repeat(255),
    }

    expect(saveSupplierSchema.safeParse(values).success).toBe(true)
    expect(
      saveSupplierSchema.safeParse({ ...values, contactChannelName: 'a'.repeat(256) }).success
    ).toBe(false)
  })
})
