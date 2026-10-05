export const BULK_IMPORT_MAX_FILE_MB = 5
export const BULK_IMPORT_MAX_FILE_BYTES = BULK_IMPORT_MAX_FILE_MB * 1024 * 1024
export const BULK_IMPORT_FILE_EXTENSIONS = ['.xlsx', '.csv'] as const
export const BULK_IMPORT_ROWS_PER_PAGE = 50

export function hasBulkImportExtension(fileName: string) {
  const lowerCaseName = fileName.toLowerCase()
  return BULK_IMPORT_FILE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension))
}

export interface BulkImportResultRow {
  readonly rowNumber: number
  readonly label: string
  readonly result: string
}

export function bulkImportResultsCsv(rows: readonly BulkImportResultRow[]) {
  const escape = (value: string | number) => {
    const text = String(value)
    const spreadsheetSafe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${spreadsheetSafe.replaceAll('"', '""')}"`
  }
  return [
    'Dòng,Đối tượng,Kết quả',
    ...rows.map((row) => [row.rowNumber, row.label, row.result].map(escape).join(',')),
  ].join('\r\n')
}
