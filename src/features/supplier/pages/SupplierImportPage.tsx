'use client'

import { toast } from 'sonner'
import {
  BulkImportPage,
  type BulkImportColumn,
  type BulkImportCommitOutcome,
  type BulkImportPreviewOutcome,
} from '@/components/operations/BulkImportPage'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  useImportSuppliersMutation,
  usePreviewSupplierImportMutation,
  useSupplierImportTemplateMutation,
} from '../hooks/use-suppliers'
import type { SupplierImportPreviewRow } from '../types/supplier.types'
import { getApiErrorMessage } from '../utils/supplier-error'
import { SUPPLIER_IMPORT_MAX_ROWS, toImportItem } from '../utils/supplier-import'

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

function getRowLabel(row: SupplierImportPreviewRow) {
  return row.supplierCode ? `${row.supplierCode} · ${row.supplierName}` : row.supplierName
}

function getRowSearchText(row: SupplierImportPreviewRow) {
  return [row.supplierCode, row.supplierName, row.phone, row.contactName].filter(Boolean).join(' ')
}

export default function SupplierImportPage() {
  const permissions = useMeQuery().data?.permissions ?? []
  const importMutation = useImportSuppliersMutation()
  const previewMutation = usePreviewSupplierImportMutation()
  const templateMutation = useSupplierImportTemplateMutation()

  async function handlePreview(
    file: File
  ): Promise<BulkImportPreviewOutcome<SupplierImportPreviewRow>> {
    try {
      const response = await previewMutation.mutateAsync(file)
      return { isSucceeded: true, rows: response.data.rows }
    } catch (error) {
      logger.error(error)
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
      logger.error(error)
      toast.error(getApiErrorMessage(error, 'Không thể tải tệp mẫu. Vui lòng thử lại.'))
    }
  }

  async function handleImport(
    rows: readonly SupplierImportPreviewRow[]
  ): Promise<BulkImportCommitOutcome> {
    try {
      await importMutation.mutateAsync({ items: rows.map(toImportItem) })
      toast.success(`Đã nhập ${rows.length} nhà cung cấp.`)
      return { isSucceeded: true }
    } catch (error) {
      logger.error(error)
      const message = getApiErrorMessage(error, 'Không thể nhập nhà cung cấp. Vui lòng thử lại.')
      toast.error(message)
      return { isSucceeded: false, message }
    }
  }

  if (!permissions.includes(P.SUPPLIERS_CREATE)) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Bạn không có quyền nhập nhà cung cấp từ tệp.
      </p>
    )
  }

  return (
    <BulkImportPage
      eyebrow="Nguồn nhập kho"
      title="Nhập danh sách nhà cung cấp"
      description={`Kiểm tra dữ liệu trước khi nhập tối đa ${SUPPLIER_IMPORT_MAX_ROWS} nhà cung cấp. Để trống Mã NCC để hệ thống tự cấp mã.`}
      entityLabel="nhà cung cấp"
      maxRows={SUPPLIER_IMPORT_MAX_ROWS}
      backHref={APP_ROUTES.suppliers}
      backLabel="Quay lại danh sách nhà cung cấp"
      listLabel="Xem danh sách nhà cung cấp"
      resultFileName="kovia-ket-qua-nhap-nha-cung-cap.csv"
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
