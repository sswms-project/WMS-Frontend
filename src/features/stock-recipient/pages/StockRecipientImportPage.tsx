'use client'

import type { Route } from 'next'
import { toast } from 'sonner'
import {
  BulkImportPage,
  type BulkImportColumn,
  type BulkImportCommitOutcome,
  type BulkImportPreviewOutcome,
} from '@/components/operations/BulkImportPage'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-error'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  useImportStockRecipientsMutation,
  usePreviewStockRecipientImportMutation,
  useStockRecipientImportTemplateMutation,
} from '../hooks/use-stock-recipients'
import type { StockRecipientImportPreviewRow } from '../types/stock-recipient.types'
import {
  STOCK_RECIPIENT_IMPORT_MAX_ROWS,
  getImportRecipientTypeLabel,
  toImportItem,
} from '../utils/stock-recipient-import'

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

function getRowLabel(row: StockRecipientImportPreviewRow) {
  return row.recipientCode ? `${row.recipientCode} · ${row.recipientName}` : row.recipientName
}

function getRowSearchText(row: StockRecipientImportPreviewRow) {
  return [row.recipientCode, row.recipientName, row.phone, row.contactName]
    .filter(Boolean)
    .join(' ')
}

export default function StockRecipientImportPage() {
  const permissions = useMeQuery().data?.permissions ?? []
  const importMutation = useImportStockRecipientsMutation()
  const previewMutation = usePreviewStockRecipientImportMutation()
  const templateMutation = useStockRecipientImportTemplateMutation()

  async function handlePreview(
    file: File
  ): Promise<BulkImportPreviewOutcome<StockRecipientImportPreviewRow>> {
    try {
      const response = await previewMutation.mutateAsync(file)
      return { isSucceeded: true, rows: response.data.rows }
    } catch (error) {
      return {
        isSucceeded: false,
        message: getApiErrorMessage(error, 'Không thể đọc tệp nhập. Vui lòng thử lại.'),
      }
    }
  }

  async function handleDownloadTemplate() {
    try {
      await templateMutation.mutateAsync()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải tệp mẫu. Vui lòng thử lại.'))
    }
  }

  async function handleImport(
    rows: readonly StockRecipientImportPreviewRow[]
  ): Promise<BulkImportCommitOutcome> {
    try {
      await importMutation.mutateAsync({ items: rows.map(toImportItem) })
      toast.success(`Đã nhập ${rows.length} khách hàng.`)
      return { isSucceeded: true }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể nhập khách hàng. Vui lòng thử lại.')
      toast.error(message)
      return { isSucceeded: false, message }
    }
  }

  if (!permissions.includes(P.STOCK_RECIPIENTS_CREATE)) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Bạn không có quyền nhập khách hàng từ tệp.
      </p>
    )
  }

  return (
    <BulkImportPage
      eyebrow="Danh mục"
      title="Nhập danh sách khách hàng"
      description={`Kiểm tra dữ liệu trước khi nhập tối đa ${STOCK_RECIPIENT_IMPORT_MAX_ROWS} khách hàng. Để trống Mã KH để hệ thống tự cấp mã.`}
      entityLabel="khách hàng"
      maxRows={STOCK_RECIPIENT_IMPORT_MAX_ROWS}
      backHref={APP_ROUTES.stockRecipients as Route}
      backLabel="Quay lại danh sách khách hàng"
      listLabel="Xem danh sách khách hàng"
      resultFileName="kovia-ket-qua-nhap-khach-hang.csv"
      columns={previewColumns}
      getRowLabel={getRowLabel}
      getRowSearchText={getRowSearchText}
      isPreviewing={previewMutation.isPending}
      isImporting={importMutation.isPending}
      isDownloadingTemplate={templateMutation.isPending}
      onDownloadTemplate={() => void handleDownloadTemplate()}
      onPreview={handlePreview}
      onImport={handleImport}
    />
  )
}
