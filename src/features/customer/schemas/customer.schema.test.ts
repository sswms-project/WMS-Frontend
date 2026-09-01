import { describe, expect, it } from 'vitest'
import { customerSchema } from './customer.schema'

describe('customer schema', () => {
  it('accepts an optional email and rejects malformed email', () => {
    const base = { customerName: 'Khách A', phone: '0900000000', address: 'Hà Nội' }
    expect(customerSchema.safeParse({ ...base, email: '' }).success).toBe(true)
    expect(customerSchema.safeParse({ ...base, email: 'invalid' }).success).toBe(false)
  })
})
