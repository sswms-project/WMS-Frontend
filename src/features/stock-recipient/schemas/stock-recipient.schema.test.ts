import { describe, expect, it } from 'vitest'
import { stockRecipientSchema } from './stock-recipient.schema'

describe('stockRecipient schema', () => {
  it('accepts an optional email and rejects malformed email', () => {
    const base = {
      recipientCode: 'KH000001',
      recipientName: 'Khách A',
      taxCode: '',
      phone: '0900000000',
      address: 'Hà Nội',
    }
    expect(stockRecipientSchema.safeParse({ ...base, email: '' }).success).toBe(true)
    expect(stockRecipientSchema.safeParse({ ...base, email: 'invalid' }).success).toBe(false)
  })

  it('requires the customer code and name but allows contact fields to be empty', () => {
    expect(
      stockRecipientSchema.safeParse({
        recipientCode: 'KH000001',
        recipientName: 'Khách A',
        taxCode: '',
        phone: '',
        email: '',
        address: '',
      }).success
    ).toBe(true)
    expect(
      stockRecipientSchema.safeParse({
        recipientCode: '',
        recipientName: '',
        taxCode: '',
        phone: '',
        email: '',
        address: '',
      }).success
    ).toBe(false)
  })
})
