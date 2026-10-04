import { describe, expect, it } from 'vitest'
import type { SupplierImportPreviewRow } from '../types/supplier.types'
import { toImportItem } from './supplier-import'

describe('toImportItem', () => {
  it('drops preview-only fields and keeps the BE command payload', () => {
    const row: SupplierImportPreviewRow = {
      rowNumber: 2,
      errors: [],
      supplierCode: null,
      supplierName: 'Công ty A',
      taxCode: null,
      phone: '0900000001',
      email: null,
      address: null,
      contactSalutation: null,
      contactName: null,
      contactEmail: null,
      contactMobile: null,
      contactChannel: null,
      contactChannelName: null,
    }

    const item = toImportItem(row)

    expect(item).not.toHaveProperty('rowNumber')
    expect(item).not.toHaveProperty('errors')
    expect(item).toMatchObject({ supplierName: 'Công ty A', phone: '0900000001' })
  })
})
