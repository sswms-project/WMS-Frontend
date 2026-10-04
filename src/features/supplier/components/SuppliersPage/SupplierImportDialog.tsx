'use client'

import {
  BulkImportDialog,
  type BulkImportColumn,
  type BulkImportPreviewOutcome,
} from '@/components/operations/BulkImportDialog'
import type { SupplierImportPreviewRow } from '../../types/supplier.types'
import { SUPPLIER_IMPORT_MAX_ROWS } from '../../utils/supplier-import'

export type SupplierImportPreviewOutcome = BulkImportPreviewOutcome<SupplierImportPreviewRow>

const previewColumns: readonly BulkImportColumn<SupplierImportPreviewRow>[] = [
  {
    key: 'supplierCode',
    header: 'Mã NCC',
    headClassName: 'w-32',
    cellClassName: 'font-mono',
    render: (row) => row.supplierCode ?? 'Tự cấp',
  },
  {
    key: 'supplierName',
    header: 'Tên nhà cung cấp',
    cellClassName: 'max-w-64 truncate',
    render: (row) => row.supplierName,
  },
  {
    key: 'phone',
    header: 'Điện thoại',
    headClassName: 'w-32',
    cellClassName: 'tabular-nums',
    render: (row) => row.phone ?? '—',
  },
]

interface SupplierImportDialogProps {
  readonly open: boolean
  readonly isPreviewing: boolean
  readonly isImporting: boolean
  readonly isDownloadingTemplate: boolean
  readonly errorMessage: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onDownloadTemplate: () => void
  readonly onPreview: (file: File) => Promise<SupplierImportPreviewOutcome>
  readonly onImport: (rows: readonly SupplierImportPreviewRow[]) => Promise<boolean>
}

export function SupplierImportDialog(props: SupplierImportDialogProps) {
  return (
    <BulkImportDialog
      {...props}
      title="Nhập nhiều nhà cung cấp"
      description={`Tải lên tệp Excel hoặc CSV để thêm tối đa ${SUPPLIER_IMPORT_MAX_ROWS} nhà cung cấp cùng lúc. Nếu để trống Mã NCC, hệ thống sẽ tự cấp mã.`}
      entityLabel="nhà cung cấp"
      columns={previewColumns}
    />
  )
}
