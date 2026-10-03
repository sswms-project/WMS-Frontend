import { describe, expect, it } from 'vitest'
import type { SupplierImportPreviewRow } from '../types/supplier.types'
import { hasSupplierImportExtension, toImportItem } from './supplier-import'

describe('hasSupplierImportExtension', () => {
  it('accepts xlsx and csv regardless of case and rejects other files', () => {
    expect(hasSupplierImportExtension('nha-cung-cap.XLSX')).toBe(true)
    expect(hasSupplierImportExtension('nha-cung-cap.csv')).toBe(true)
    expect(hasSupplierImportExtension('nha-cung-cap.pdf')).toBe(false)
    expect(hasSupplierImportExtension('csv')).toBe(false)
  })
})

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
