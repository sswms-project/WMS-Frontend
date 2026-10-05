'use client'

import { ArrowLeft, Download, FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { useMemo, useState, type ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BULK_IMPORT_FILE_EXTENSIONS,
  BULK_IMPORT_MAX_FILE_BYTES,
  BULK_IMPORT_MAX_FILE_MB,
  BULK_IMPORT_ROWS_PER_PAGE,
  hasBulkImportExtension,
} from './bulk-import'
import { BulkImportResult, type BulkImportResultItem } from './BulkImportResult'

export interface BulkImportRow {
  readonly rowNumber: number
  readonly errors: readonly string[]
}

export type BulkImportPreviewOutcome<TRow extends BulkImportRow> =
  | { readonly isSucceeded: true; readonly rows: readonly TRow[] }
  | { readonly isSucceeded: false; readonly message: string }

export type BulkImportCommitOutcome =
  | { readonly isSucceeded: true }
  | { readonly isSucceeded: false; readonly message: string }

export interface BulkImportColumn<TRow extends BulkImportRow> {
  readonly key: string
  readonly header: string
  readonly headClassName?: string
  readonly cellClassName?: string
  readonly render: (row: TRow) => ReactNode
}

type StatusFilter = 'All' | 'Valid' | 'Invalid'

interface BulkImportPageProps<TRow extends BulkImportRow> {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly entityLabel: string
  readonly maxRows: number
  readonly backHref: Route
  readonly backLabel: string
  readonly listLabel: string
  readonly resultFileName: string
  readonly columns: readonly BulkImportColumn<TRow>[]
  readonly getRowLabel: (row: TRow) => string
  readonly getRowSearchText: (row: TRow) => string
  readonly isPreviewing: boolean
  readonly isImporting: boolean
  readonly isDownloadingTemplate: boolean
  readonly onDownloadTemplate: () => void
  readonly onPreview: (file: File) => Promise<BulkImportPreviewOutcome<TRow>>
  readonly onImport: (rows: readonly TRow[]) => Promise<BulkImportCommitOutcome>
}

export function BulkImportPage<TRow extends BulkImportRow>({
  eyebrow,
  title,
  description,
  entityLabel,
  maxRows,
  backHref,
  backLabel,
  listLabel,
  resultFileName,
  columns,
  getRowLabel,
  getRowSearchText,
  isPreviewing,
  isImporting,
  isDownloadingTemplate,
  onDownloadTemplate,
  onPreview,
  onImport,
}: BulkImportPageProps<TRow>) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [rows, setRows] = useState<readonly TRow[] | null>(null)
  const [selectedRows, setSelectedRows] = useState<readonly number[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [page, setPage] = useState(1)
  const [resultItems, setResultItems] = useState<readonly BulkImportResultItem[] | null>(null)

  const validRowNumbers = useMemo(
    () => rows?.filter((row) => row.errors.length === 0).map((row) => row.rowNumber) ?? [],
    [rows]
  )
  const invalidCount = (rows?.length ?? 0) - validRowNumbers.length
  const filteredRows = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    return (
      rows?.filter(
        (row) =>
          (statusFilter === 'All' ||
            (statusFilter === 'Valid' ? row.errors.length === 0 : row.errors.length > 0)) &&
          (!normalizedSearch || getRowSearchText(row).toLowerCase().includes(normalizedSearch))
      ) ?? []
    )
  }, [rows, searchText, statusFilter, getRowSearchText])
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / BULK_IMPORT_ROWS_PER_PAGE))
  const visibleRows = filteredRows.slice(
    (page - 1) * BULK_IMPORT_ROWS_PER_PAGE,
    page * BULK_IMPORT_ROWS_PER_PAGE
  )
  const visibleValidRowNumbers = visibleRows
    .filter((row) => row.errors.length === 0)
    .map((row) => row.rowNumber)
  const areAllVisibleValidRowsSelected =
    visibleValidRowNumbers.length > 0 &&
    visibleValidRowNumbers.every((rowNumber) => selectedRows.includes(rowNumber))

  function resetSession() {
    setFileName(null)
    setFileError(null)
    setImportError(null)
    setRows(null)
    setSelectedRows([])
    setSearchText('')
    setStatusFilter('All')
    setPage(1)
    setResultItems(null)
  }

  async function handleFileChange(file: File | undefined) {
    if (!file || isPreviewing) return
    setFileError(null)
    if (!hasBulkImportExtension(file.name)) {
      setFileError(`Chỉ hỗ trợ tệp ${BULK_IMPORT_FILE_EXTENSIONS.join(' hoặc ')}.`)
      return
    }
    if (file.size > BULK_IMPORT_MAX_FILE_BYTES) {
      setFileError(`Tệp vượt quá ${BULK_IMPORT_MAX_FILE_MB} MB.`)
      return
    }

    const outcome = await onPreview(file)
    if (!outcome.isSucceeded) {
      setFileError(outcome.message)
      return
    }
    resetSession()
    setFileName(file.name)
    setRows(outcome.rows)
    // Mặc định chọn sẵn mọi dòng hợp lệ; người dùng có thể bỏ chọn từng dòng trước khi nhập.
    setSelectedRows(
      outcome.rows.filter((row) => row.errors.length === 0).map((row) => row.rowNumber)
    )
  }

  async function handleImport() {
    if (!rows || selectedRows.length === 0 || isImporting) return
    const selected = new Set(selectedRows)
    const rowsToImport = rows.filter(
      (row) => row.errors.length === 0 && selected.has(row.rowNumber)
    )
    if (rowsToImport.length === 0) return

    const outcome = await onImport(rowsToImport)
    if (!outcome.isSucceeded) {
      setImportError(outcome.message)
      return
    }
    setImportError(null)
    setResultItems(
      rows.map((row) => {
        const isImported = row.errors.length === 0 && selected.has(row.rowNumber)
        return {
          rowNumber: row.rowNumber,
          label: getRowLabel(row),
          isImported,
          result: isImported
            ? 'Đã nhập'
            : row.errors.length > 0
              ? `Bỏ qua: ${row.errors.join(' ')}`
              : 'Bỏ qua: không được chọn',
        }
      })
    )
  }

  function toggleRow(rowNumber: number, checked: boolean) {
    setSelectedRows((current) =>
      checked
        ? [...new Set([...current, rowNumber])]
        : current.filter((value) => value !== rowNumber)
    )
  }

  function toggleVisibleRows(checked: boolean) {
    setSelectedRows((current) =>
      checked
        ? [...new Set([...current, ...visibleValidRowNumbers])]
        : current.filter((value) => !visibleValidRowNumbers.includes(value))
    )
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={backHref} aria-label={backLabel}>
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <p className="text-primary text-xs font-medium">{eyebrow}</p>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          </div>
        </div>
        <Button variant="outline" disabled={isDownloadingTemplate} onClick={onDownloadTemplate}>
          {isDownloadingTemplate ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          Mẫu XLSX
        </Button>
      </header>

      {resultItems ? (
        <BulkImportResult
          entityLabel={entityLabel}
          listHref={backHref}
          listLabel={listLabel}
          resultFileName={resultFileName}
          items={resultItems}
          onRestart={resetSession}
        />
      ) : !rows ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
              <FileSpreadsheet aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">Chọn tệp {entityLabel}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                XLSX theo mẫu (cũng nhận CSV cùng các cột), tối đa {maxRows} dòng và{' '}
                {BULK_IMPORT_MAX_FILE_MB} MB.
              </p>
            </div>
            <Button asChild disabled={isPreviewing}>
              <label htmlFor="bulk-import-file" className="cursor-pointer">
                {isPreviewing ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Upload aria-hidden="true" />
                )}
                {isPreviewing ? 'Đang kiểm tra tệp…' : 'Tải tệp lên'}
              </label>
            </Button>
            <Input
              id="bulk-import-file"
              type="file"
              className="sr-only"
              aria-label={`Tệp ${entityLabel}`}
              accept={BULK_IMPORT_FILE_EXTENSIONS.join(',')}
              disabled={isPreviewing}
              onChange={(event) => {
                void handleFileChange(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            {fileError ? (
              <p role="alert" className="text-destructive text-sm">
                {fileError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <section aria-label="Tổng quan bản xem trước" className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Tổng số dòng" value={rows.length} />
            <SummaryCard label="Hợp lệ" value={validRowNumbers.length} tone="success" />
            <SummaryCard label="Không hợp lệ" value={invalidCount} tone="danger" />
          </section>

          {importError ? (
            <Alert variant="destructive">
              <AlertTitle>Không thể nhập {entityLabel}</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-base">Bản xem trước</CardTitle>
                  <p className="text-muted-foreground mt-1 text-xs" aria-live="polite">
                    {fileName} · đã chọn {selectedRows.length}/{validRowNumbers.length} dòng hợp lệ
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    aria-label="Tìm trong bản xem trước"
                    value={searchText}
                    placeholder="Tìm theo mã, tên, liên hệ"
                    onChange={(event) => {
                      setSearchText(event.target.value)
                      setPage(1)
                    }}
                  />
                  <NativeSelect
                    aria-label="Lọc trạng thái"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as StatusFilter)
                      setPage(1)
                    }}
                  >
                    <NativeSelectOption value="All">Tất cả</NativeSelectOption>
                    <NativeSelectOption value="Valid">Hợp lệ</NativeSelectOption>
                    <NativeSelectOption value="Invalid">Không hợp lệ</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          aria-label="Chọn tất cả dòng hợp lệ"
                          checked={areAllVisibleValidRowsSelected}
                          disabled={visibleValidRowNumbers.length === 0}
                          onCheckedChange={(checked) => toggleVisibleRows(checked === true)}
                        />
                      </TableHead>
                      <TableHead className="w-16">Dòng</TableHead>
                      {columns.map((column) => (
                        <TableHead key={column.key} className={column.headClassName}>
                          {column.header}
                        </TableHead>
                      ))}
                      <TableHead>Kết quả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + 3}
                          className="text-muted-foreground h-24 text-center"
                        >
                          Không có dòng nào phù hợp bộ lọc.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((row) => {
                        const isValid = row.errors.length === 0
                        return (
                          <TableRow key={row.rowNumber}>
                            <TableCell>
                              <Checkbox
                                aria-label={`Chọn dòng ${row.rowNumber}`}
                                disabled={!isValid}
                                checked={selectedRows.includes(row.rowNumber)}
                                onCheckedChange={(checked) =>
                                  toggleRow(row.rowNumber, checked === true)
                                }
                              />
                            </TableCell>
                            <TableCell className="tabular-nums">{row.rowNumber}</TableCell>
                            {columns.map((column) => (
                              <TableCell key={column.key} className={column.cellClassName}>
                                {column.render(row)}
                              </TableCell>
                            ))}
                            <TableCell className="min-w-56">
                              <Badge variant={isValid ? 'default' : 'destructive'}>
                                {isValid ? 'Hợp lệ' : 'Không hợp lệ'}
                              </Badge>
                              {row.errors.map((message) => (
                                <p key={message} className="text-muted-foreground mt-1 text-xs">
                                  {message}
                                </p>
                              ))}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredRows.length > BULK_IMPORT_ROWS_PER_PAGE ? (
                <div className="flex items-center justify-end gap-2 border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Trang trước
                  </Button>
                  <span className="text-muted-foreground text-xs">
                    {page} / {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" disabled={isImporting} onClick={resetSession}>
              Hủy phiên nhập
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={selectedRows.length === 0 || isImporting}>
                  {isImporting ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : null}
                  Nhập {selectedRows.length} {entityLabel}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận nhập {entityLabel}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hệ thống sẽ nhập {selectedRows.length} dòng hợp lệ đã chọn.
                    {invalidCount > 0
                      ? ` ${invalidCount} dòng không hợp lệ sẽ được bỏ qua; sửa tệp và tải lại để nhập các dòng đó.`
                      : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Quay lại kiểm tra</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void handleImport()}>
                    Xác nhận nhập
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  readonly label: string
  readonly value: number
  readonly tone?: 'success' | 'danger'
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p
          className={
            tone === 'danger'
              ? 'text-destructive mt-1 text-2xl font-semibold'
              : tone === 'success'
                ? 'text-primary mt-1 text-2xl font-semibold'
                : 'mt-1 text-2xl font-semibold'
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
