import { describe, expect, it } from 'vitest'
import { updateProfileRequestSchema } from './profile.schema'

describe('updateProfileRequestSchema', () => {
  it('keeps login email outside the editable profile contract', () => {
    const result = updateProfileRequestSchema.parse({
      fullName: 'Kovia Owner',
      phone: '0901234567',
      email: 'replacement@example.com',
    })

    expect(result).toEqual({ fullName: 'Kovia Owner', phone: '0901234567' })
    expect(result).not.toHaveProperty('email')
  })
})
