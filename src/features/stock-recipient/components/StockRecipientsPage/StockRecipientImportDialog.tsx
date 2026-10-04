'use client'

import {
  BulkImportDialog,
  type BulkImportColumn,
  type BulkImportPreviewOutcome,
} from '@/components/operations/BulkImportDialog'
import type { StockRecipientImportPreviewRow } from '../../types/stock-recipient.types'
import {
  STOCK_RECIPIENT_IMPORT_MAX_ROWS,
  getImportRecipientTypeLabel,
} from '../../utils/stock-recipient-import'

export type StockRecipientImportPreviewOutcome =
  BulkImportPreviewOutcome<StockRecipientImportPreviewRow>

const previewColumns: readonly BulkImportColumn<StockRecipientImportPreviewRow>[] = [
  {
    key: 'recipientCode',
    header: 'Mã KH',
    headClassName: 'w-32',
    cellClassName: 'font-mono',
    render: (row) => row.recipientCode ?? 'Tự cấp',
  },
  {
    key: 'recipientName',
    header: 'Tên khách hàng',
    cellClassName: 'max-w-64 truncate',
    render: (row) => row.recipientName,
  },
  {
    key: 'recipientType',
    header: 'Loại',
    headClassName: 'w-28',
    render: (row) => getImportRecipientTypeLabel(row.recipientType),
  },
  {
    key: 'phone',
    header: 'Điện thoại',
    headClassName: 'w-32',
    cellClassName: 'tabular-nums',
    render: (row) => row.phone ?? '—',
  },
]

interface StockRecipientImportDialogProps {
  readonly open: boolean
  readonly isPreviewing: boolean
  readonly isImporting: boolean
  readonly isDownloadingTemplate: boolean
  readonly errorMessage: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onDownloadTemplate: () => void
  readonly onPreview: (file: File) => Promise<StockRecipientImportPreviewOutcome>
  readonly onImport: (rows: readonly StockRecipientImportPreviewRow[]) => Promise<boolean>
}

export function StockRecipientImportDialog(props: StockRecipientImportDialogProps) {
  return (
    <BulkImportDialog
      {...props}
      title="Nhập nhiều khách hàng"
      description={`Tải lên tệp Excel hoặc CSV để thêm tối đa ${STOCK_RECIPIENT_IMPORT_MAX_ROWS} khách hàng cùng lúc. Nếu để trống Mã KH, hệ thống sẽ tự cấp mã.`}
      entityLabel="khách hàng"
      columns={previewColumns}
    />
  )
}
