import { describe, expect, it } from 'vitest'
import { bulkImportResultsCsv, hasBulkImportExtension } from './bulk-import'

describe('bulkImportResultsCsv', () => {
  it('quotes values and neutralises spreadsheet formulas', () => {
    const csv = bulkImportResultsCsv([
      { rowNumber: 2, label: '=HYPERLINK("x")', result: 'Đã nhập' },
      { rowNumber: 3, label: 'Công ty "A"', result: 'Bỏ qua: lỗi' },
    ])

    expect(csv).toBe(
      [
        'Dòng,Đối tượng,Kết quả',
        `"2","'=HYPERLINK(""x"")","Đã nhập"`,
        '"3","Công ty ""A""","Bỏ qua: lỗi"',
      ].join('\r\n')
    )
  })
})

describe('hasBulkImportExtension', () => {
  it('accepts xlsx and csv regardless of case and rejects other files', () => {
    expect(hasBulkImportExtension('danh-sach.XLSX')).toBe(true)
    expect(hasBulkImportExtension('danh-sach.csv')).toBe(true)
    expect(hasBulkImportExtension('danh-sach.pdf')).toBe(false)
    expect(hasBulkImportExtension('csv')).toBe(false)
  })
})
