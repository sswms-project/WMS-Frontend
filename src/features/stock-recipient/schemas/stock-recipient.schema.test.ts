import { describe, expect, it } from 'vitest'
import {
  emptyStockRecipientFormValues,
  stockRecipientSchema,
  toStockRecipientRequest,
} from './stock-recipient.schema'

describe('stockRecipient schema', () => {
  it('accepts an optional email and rejects malformed email', () => {
    expect(
      stockRecipientSchema.safeParse({
        ...emptyStockRecipientFormValues,
        recipientCode: 'KH000001',
        recipientName: 'Khách A',
      }).success
    ).toBe(true)
    expect(
      stockRecipientSchema.safeParse({
        ...emptyStockRecipientFormValues,
        recipientCode: 'KH000001',
        recipientName: 'Khách A',
        email: 'invalid',
      }).success
    ).toBe(false)
  })

  it('requires a trimmed customer code and name and normalizes surrounding whitespace', () => {
    const valid = stockRecipientSchema.safeParse({
      ...emptyStockRecipientFormValues,
      recipientCode: '  KH000001  ',
      recipientName: '  Khách A  ',
    })
    expect(valid.success).toBe(true)
    if (valid.success) {
      expect(valid.data.recipientCode).toBe('KH000001')
      expect(valid.data.recipientName).toBe('Khách A')
    }

    expect(
      stockRecipientSchema.safeParse({
        ...emptyStockRecipientFormValues,
        recipientCode: '   ',
        recipientName: '  ',
      }).success
    ).toBe(false)
  })

  it('accepts both customer types and the optional contact data', () => {
    for (const recipientType of ['Organization', 'Individual'] as const) {
      expect(
        stockRecipientSchema.safeParse({
          ...emptyStockRecipientFormValues,
          recipientCode: 'KH000001',
          recipientName: 'Khách A',
          recipientType,
          contactName: 'Nguyễn An',
          email: 'an@example.com',
          shippingAddress: 'Kho nhận hàng',
          contactChannel: 'Zalo',
          contactChannelName: 'kovia.support',
        }).success
      ).toBe(true)
    }
  })

  it('preserves email for both customer types and omits organization-only data for individuals', () => {
    const organization = toStockRecipientRequest({
      ...emptyStockRecipientFormValues,
      recipientCode: 'KH000001',
      recipientName: 'Công ty A',
      recipientType: 'Organization',
      email: 'an@company.example',
      contactName: 'Nguyễn An',
    })
    expect(organization.email).toBe('an@company.example')
    expect(organization.contactName).toBe('Nguyễn An')

    const individual = toStockRecipientRequest({
      ...emptyStockRecipientFormValues,
      recipientCode: 'KH000002',
      recipientName: 'Nguyễn An',
      recipientType: 'Individual',
      email: 'an@example.com',
      contactName: 'old company contact',
    })
    expect(individual.email).toBe('an@example.com')
    expect(individual.contactName).toBeNull()
  })
})
