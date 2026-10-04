import type { ImportSupplierItem, SupplierImportPreviewRow } from '../types/supplier.types'

export const SUPPLIER_IMPORT_MAX_ROWS = 500

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
