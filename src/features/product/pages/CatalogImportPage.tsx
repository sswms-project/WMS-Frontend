'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { BulkImportPage, type BulkImportColumn } from '@/components/operations/BulkImportPage'
import { BulkImportPendingBody } from '@/components/operations/BulkImportWorkspace'
import { downloadBulkImportFile } from '@/components/operations/bulk-import'
import { Input } from '@/components/ui/input'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { getApiErrorMessage, isApiErrorResponse } from '@/lib/api-error'
import { APP_ROUTES } from '@/routes/app-routes'
import { useCatalogImport } from '../hooks/use-catalog-import'
import type { CatalogImportKind, CatalogImportRow } from '../types/catalog-import.types'

export default function CatalogImportPage({ kind }: { readonly kind: CatalogImportKind }) {
  const me = useMeQuery()
  const operations = useCatalogImport(kind)
  const edits = useRef(new Map<number, string>())
  const [validationRevision, setValidationRevision] = useState(0)
  const categories = kind === 'categories'
  const label = categories ? 'nhóm vật tư hàng hóa' : 'đơn vị tính'
  const columns: BulkImportColumn<CatalogImportRow>[] = [
    {
      key: 'code',
      header: categories ? 'Mã nhóm' : 'Mã ĐVT',
      cellClassName: 'min-w-48',
      render: (row) => (
        <Input
          key={`${row.rowNumber}:${row.code}`}
          aria-label={`Mã dòng ${row.rowNumber}`}
          defaultValue={edits.current.get(row.rowNumber) ?? row.code}
          maxLength={50}
          spellCheck={false}
          autoComplete="off"
          disabled={operations.commit.isPending || operations.preview.isPending}
          onChange={(event) => {
            edits.current.set(row.rowNumber, event.target.value)
            setValidationRevision((value) => value + 1)
          }}
        />
      ),
    },
    {
      key: 'name',
      header: categories ? 'Tên nhóm' : 'Tên ĐVT',
      cellClassName: 'min-w-48 wrap-anywhere whitespace-normal',
      render: (row) => row.name,
    },
    ...(categories
      ? [
          {
            key: 'parentCode',
            header: 'Nhóm cha',
            cellClassName: 'min-w-48 wrap-anywhere whitespace-normal',
            render: (row: CatalogImportRow) => row.parentPath || row.parentCode || '—',
          },
        ]
      : [
          {
            key: 'quantityPrecision',
            header: 'Số chữ số thập phân',
            render: (row: CatalogImportRow) => row.quantityPrecision,
          },
          {
            key: 'symbol',
            header: 'Ký hiệu',
            isSupplementary: true,
            render: (row: CatalogImportRow) => row.symbol || '—',
          },
        ]),
    {
      key: 'description',
      header: 'Mô tả',
      isSupplementary: true,
      cellClassName: 'max-w-80 wrap-anywhere whitespace-normal',
      render: (row) => row.description || '—',
    },
  ]
  if (me.isPending) return <BulkImportPendingBody />
  if (
    me.isError ||
    !me.data?.permissions.includes(categories ? P.CATEGORIES_MANAGE : P.UNITS_MANAGE)
  )
    return <p role="status">Bạn không có quyền nhập {label}.</p>
  return (
    <BulkImportPage<CatalogImportRow>
      validationRevision={validationRevision}
      key={`${kind}:${me.data.tenantId}:${me.data.id}`}
      eyebrow="Danh mục"
      title={`Nhập ${label}`}
      entityLabel={label}
      maxRows={500}
      backHref={categories ? APP_ROUTES.categories : APP_ROUTES.units}
      backLabel={`Quay lại danh sách ${label}`}
      listLabel="Về danh sách"
      resultFileName={`kovia-ket-qua-${kind}.csv`}
      columns={columns}
      getRowLabel={(row) => `${row.code} · ${row.name}`}
      getRowSearchText={(row) => [row.code, row.name, row.parentCode, ...row.errors].join(' ')}
      isPreviewing={operations.inspect.isPending || operations.preview.isPending}
      isImporting={operations.commit.isPending}
      isDownloadingTemplate={operations.template.isPending}
      onInspect={async (file, delimiter) => {
        edits.current.clear()
        try {
          return {
            isSucceeded: true,
            inspection: await operations.inspect.mutateAsync({ file, delimiter }),
          }
        } catch (error) {
          return {
            isSucceeded: false,
            message: getApiErrorMessage(error, 'Không thể đọc cấu trúc tệp.'),
          }
        }
      }}
      onPreview={async (file, options) => {
        try {
          return {
            isSucceeded: true,
            rows: (
              await operations.preview.mutateAsync({
                file,
                options,
                codeOverrides: [...edits.current].map(([rowNumber, code]) => ({ rowNumber, code })),
              })
            ).rows,
          }
        } catch (error) {
          return {
            isSucceeded: false,
            message: getApiErrorMessage(error, 'Không thể kiểm tra tệp.'),
          }
        }
      }}
      onDownloadTemplate={async () => {
        try {
          downloadBulkImportFile(await operations.template.mutateAsync(), `kovia-mau-${kind}.xlsx`)
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Không thể tải mẫu.'))
        }
      }}
      onImport={async (rows) => {
        try {
          await operations.commit.mutateAsync(
            rows.map((row) => ({
              rowNumber: row.rowNumber,
              code: row.code,
              name: row.name,
              parentCode: row.parentCode,
              symbol: row.symbol,
              quantityPrecision: row.quantityPrecision,
              description: row.description,
            }))
          )
          toast.success(`Đã nhập ${rows.length} ${label}.`)
          return { isSucceeded: true }
        } catch (error) {
          return {
            isSucceeded: false,
            message: getApiErrorMessage(error, 'Không thể nhập danh mục. Hãy kiểm tra lại.'),
            requiresReconciliation: !isApiErrorResponse(error) || error.statusCode >= 500,
          }
        }
      }}
    />
  )
}
