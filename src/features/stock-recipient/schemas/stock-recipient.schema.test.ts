import { describe, expect, it } from 'vitest'
import { stockRecipientSchema } from './stock-recipient.schema'

describe('stockRecipient schema', () => {
  it('accepts an optional email and rejects malformed email', () => {
    const base = { recipientName: 'Khách A', phone: '0900000000', address: 'Hà Nội' }
    expect(stockRecipientSchema.safeParse({ ...base, email: '' }).success).toBe(true)
    expect(stockRecipientSchema.safeParse({ ...base, email: 'invalid' }).success).toBe(false)
  })
})
