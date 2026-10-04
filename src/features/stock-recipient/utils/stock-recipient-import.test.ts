import { describe, expect, it } from 'vitest'
import type { StockRecipientImportPreviewRow } from '../types/stock-recipient.types'
import { getImportRecipientTypeLabel, toImportItem } from './stock-recipient-import'

describe('getImportRecipientTypeLabel', () => {
  it('labels known types, defaults blanks to organization and keeps unknown values', () => {
    expect(getImportRecipientTypeLabel('Individual')).toBe('Cá nhân')
    expect(getImportRecipientTypeLabel('Organization')).toBe('Doanh nghiệp')
    expect(getImportRecipientTypeLabel(null)).toBe('Doanh nghiệp')
    expect(getImportRecipientTypeLabel('Hộ kinh doanh')).toBe('Hộ kinh doanh')
  })
})

describe('toImportItem', () => {
  it('drops preview-only fields and keeps the BE command payload', () => {
    const row: StockRecipientImportPreviewRow = {
      rowNumber: 2,
      errors: [],
      recipientCode: null,
      recipientName: 'Khách A',
      recipientType: 'Individual',
      taxCode: null,
      phone: '0900000001',
      email: null,
      address: null,
      shippingAddress: null,
      contactSalutation: null,
      contactName: null,
      contactMobile: null,
      contactChannel: null,
      contactChannelName: null,
    }

    const item = toImportItem(row)

    expect(item).not.toHaveProperty('rowNumber')
    expect(item).not.toHaveProperty('errors')
    expect(item).toMatchObject({
      recipientName: 'Khách A',
      recipientType: 'Individual',
      phone: '0900000001',
    })
  })
})
