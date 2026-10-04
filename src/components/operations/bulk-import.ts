export const BULK_IMPORT_MAX_FILE_MB = 5
export const BULK_IMPORT_MAX_FILE_BYTES = BULK_IMPORT_MAX_FILE_MB * 1024 * 1024
export const BULK_IMPORT_FILE_EXTENSIONS = ['.xlsx', '.csv'] as const

export function hasBulkImportExtension(fileName: string) {
  const lowerCaseName = fileName.toLowerCase()
  return BULK_IMPORT_FILE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension))
}
