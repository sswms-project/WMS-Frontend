import type {
  ImportStockRecipientItem,
  StockRecipientImportPreviewRow,
} from '../types/stock-recipient.types'

export const STOCK_RECIPIENT_IMPORT_MAX_ROWS = 500

const RECIPIENT_TYPE_LABELS: Readonly<Record<string, string>> = {
  Organization: 'Doanh nghiệp',
  Individual: 'Cá nhân',
}

export function getImportRecipientTypeLabel(recipientType: string | null) {
  if (!recipientType) return RECIPIENT_TYPE_LABELS.Organization
  return RECIPIENT_TYPE_LABELS[recipientType] ?? recipientType
}

export function toImportItem(row: StockRecipientImportPreviewRow): ImportStockRecipientItem {
  return {
    recipientCode: row.recipientCode,
    recipientName: row.recipientName,
    recipientType: row.recipientType,
    taxCode: row.taxCode,
    phone: row.phone,
    email: row.email,
    address: row.address,
    shippingAddress: row.shippingAddress,
    contactSalutation: row.contactSalutation,
    contactName: row.contactName,
    contactMobile: row.contactMobile,
    contactChannel: row.contactChannel,
    contactChannelName: row.contactChannelName,
  }
}
