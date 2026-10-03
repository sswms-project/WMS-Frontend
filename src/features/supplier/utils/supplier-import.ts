import type { ImportSupplierItem, SupplierImportPreviewRow } from '../types/supplier.types'

export const SUPPLIER_IMPORT_MAX_ROWS = 500
export const SUPPLIER_IMPORT_MAX_FILE_MB = 5
export const SUPPLIER_IMPORT_MAX_FILE_BYTES = SUPPLIER_IMPORT_MAX_FILE_MB * 1024 * 1024
export const SUPPLIER_IMPORT_FILE_EXTENSIONS = ['.xlsx', '.csv'] as const

export function hasSupplierImportExtension(fileName: string) {
  const lowerCaseName = fileName.toLowerCase()
  return SUPPLIER_IMPORT_FILE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension))
}

export function toImportItem(row: SupplierImportPreviewRow): ImportSupplierItem {
  return {
    supplierCode: row.supplierCode,
    supplierName: row.supplierName,
    taxCode: row.taxCode,
    phone: row.phone,
    email: row.email,
    address: row.address,
    contactSalutation: row.contactSalutation,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactMobile: row.contactMobile,
    contactChannel: row.contactChannel,
    contactChannelName: row.contactChannelName,
  }
}
