import { describe, expect, it } from 'vitest'
import { hasBulkImportExtension } from './bulk-import'

describe('hasBulkImportExtension', () => {
  it('accepts xlsx and csv regardless of case and rejects other files', () => {
    expect(hasBulkImportExtension('danh-sach.XLSX')).toBe(true)
    expect(hasBulkImportExtension('danh-sach.csv')).toBe(true)
    expect(hasBulkImportExtension('danh-sach.pdf')).toBe(false)
    expect(hasBulkImportExtension('csv')).toBe(false)
  })
})
