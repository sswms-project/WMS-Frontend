import { describe, expect, it } from 'vitest'
import { organizationFormSchema, updateOrganizationRequestSchema } from './organization.schema'

describe('organizationFormSchema', () => {
  it('accepts values supported by the organization API', () => {
    expect(
      organizationFormSchema.parse({
        tenantName: 'Kovia Logistics',
        phone: '+84 901-234-567',
        address: 'Thu Duc, Ho Chi Minh City',
        defaultCurrency: 'vnd',
      })
    ).toEqual({
      tenantName: 'Kovia Logistics',
      phone: '+84 901-234-567',
      address: 'Thu Duc, Ho Chi Minh City',
      defaultCurrency: 'VND',
    })
  })

  it('rejects an invalid phone number', () => {
    expect(() =>
      organizationFormSchema.parse({
        tenantName: 'Kovia Logistics',
        phone: 'phone-number',
        address: '',
        defaultCurrency: 'VND',
      })
    ).toThrow()
  })

  it('allows partial update payloads', () => {
    expect(updateOrganizationRequestSchema.parse({ tenantName: 'Kovia' })).toEqual({
      tenantName: 'Kovia',
    })
  })

  it('normalizes a currency-only update payload', () => {
    expect(updateOrganizationRequestSchema.parse({ defaultCurrency: ' usd ' })).toEqual({
      defaultCurrency: 'USD',
    })
  })

  it('rejects an invalid currency code', () => {
    expect(() => updateOrganizationRequestSchema.parse({ defaultCurrency: 'VN' })).toThrow()
  })
})
