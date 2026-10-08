'use client'

import { Download, LoaderCircle } from 'lucide-react'
import type { Route } from 'next'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BulkImportMapping } from './BulkImportMapping'
import { OperationalListPanel } from './OperationalListPanel'
import { OperationalPagination } from './OperationalPagination'
import { Field, FieldLabel } from '@/components/ui/field'
import { useImportNavigation } from './use-import-navigation'
import {
  initialSpreadsheetMapping,
  spreadsheetIgnoredData,
  spreadsheetMappingError,
} from './spreadsheet-import'
import type {
  SpreadsheetImportInspection,
  SpreadsheetImportOptions,
} from './spreadsheet-import.types'
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
import { BulkImportHeader } from './BulkImportHeader'
import { BulkImportFilePicker } from './BulkImportFilePicker'

export interface BulkImportRow {
  readonly rowNumber: number
  readonly errors: readonly string[]
}

export type BulkImportPreviewOutcome<TRow extends BulkImportRow> =
  | { readonly isSucceeded: true; readonly rows: readonly TRow[] }
  | { readonly isSucceeded: false; readonly message: string }

export type BulkImportCommitOutcome =
  | { readonly isSucceeded: true }
  | {
      readonly isSucceeded: false
      readonly message: string
      readonly requiresReconciliation?: boolean
    }

export type BulkImportInspectOutcome =
  | { readonly isSucceeded: true; readonly inspection: SpreadsheetImportInspection }
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
  readonly onInspect: (file: File, csvDelimiter: string) => Promise<BulkImportInspectOutcome>
  readonly onPreview: (
    file: File,
    options: SpreadsheetImportOptions
  ) => Promise<BulkImportPreviewOutcome<TRow>>
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
  onInspect,
  onPreview,
  onImport,
}: BulkImportPageProps<TRow>) {
  const [file, setFile] = useState<File | null>(null)
  const [inspection, setInspection] = useState<SpreadsheetImportInspection | null>(null)
  const [options, setOptions] = useState<SpreadsheetImportOptions | null>(null)
  const [delimiter, setDelimiter] = useState('auto')
  const [working, setWorking] = useState(false)
  const [needsRecheck, setNeedsRecheck] = useState(false)
  const [uncertainCommit, setUncertainCommit] = useState(false)
  const [acceptedIgnored, setAcceptedIgnored] = useState(false)
  const inFlight = useRef(false)
  const busy = working || isPreviewing || isImporting
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [rows, setRows] = useState<readonly TRow[] | null>(null)
  const [selectedRows, setSelectedRows] = useState<readonly number[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [page, setPage] = useState(1)
  const [resultItems, setResultItems] = useState<readonly BulkImportResultItem[] | null>(null)
  const step = resultItems ? 3 : rows ? 2 : inspection ? 1 : 0
  const stepHeading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)
  const ignored = inspection && options ? spreadsheetIgnoredData(inspection, options) : null
  const hasIgnored = Boolean(ignored && (ignored.sheets.length || ignored.columns.length))
  useImportNavigation(Boolean(file && !resultItems), busy)
  useEffect(() => {
    if (previousStep.current !== step) stepHeading.current?.focus()
    previousStep.current = step
  }, [step])

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
    setFile(null)
    setInspection(null)
    setOptions(null)
    setNeedsRecheck(false)
    setUncertainCommit(false)
    setAcceptedIgnored(false)
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
    if (!file || busy || inFlight.current) return
    setFileError(null)
    if (!hasBulkImportExtension(file.name)) {
      setFileError(`Chỉ hỗ trợ tệp ${BULK_IMPORT_FILE_EXTENSIONS.join(' hoặc ')}.`)
      return
    }
    if (file.size > BULK_IMPORT_MAX_FILE_BYTES) {
      setFileError(`Tệp vượt quá ${BULK_IMPORT_MAX_FILE_MB} MB.`)
      return
    }

    resetSession()
    setFile(file)
    setFileName(file.name)
    inFlight.current = true
    setWorking(true)
    try {
      const outcome = await onInspect(file, delimiter)
      if (!outcome.isSucceeded) {
        setFileError(outcome.message)
        return
      }
      setInspection(outcome.inspection)
      setOptions(initialSpreadsheetMapping(outcome.inspection))
    } finally {
      inFlight.current = false
      setWorking(false)
    }
  }

  async function handlePreview() {
    if (
      !file ||
      !inspection ||
      !options ||
      busy ||
      inFlight.current ||
      uncertainCommit ||
      spreadsheetMappingError(inspection, options)
    )
      return
    inFlight.current = true
    setWorking(true)
    setFileError(null)
    try {
      const outcome = await onPreview(file, options)
      if (!outcome.isSucceeded) {
        setFileError(outcome.message)
        return
      }
      const valid = outcome.rows
        .filter((row) => row.errors.length === 0)
        .map((row) => row.rowNumber)
      setSelectedRows(needsRecheck ? selectedRows.filter((row) => valid.includes(row)) : valid)
      setRows(outcome.rows)
      setNeedsRecheck(false)
      setImportError(null)
      setPage(1)
      setSearchText('')
      setStatusFilter('All')
    } finally {
      inFlight.current = false
      setWorking(false)
    }
  }

  async function handleImport() {
    if (
      !rows ||
      selectedRows.length === 0 ||
      busy ||
      inFlight.current ||
      needsRecheck ||
      uncertainCommit ||
      (hasIgnored && !acceptedIgnored)
    )
      return
    const selected = new Set(selectedRows)
    const rowsToImport = rows.filter(
      (row) => row.errors.length === 0 && selected.has(row.rowNumber)
    )
    if (rowsToImport.length === 0) return

    inFlight.current = true
    setWorking(true)
    try {
      const outcome = await onImport(rowsToImport)
      if (!outcome.isSucceeded) {
        setImportError(outcome.message)
        setNeedsRecheck(true)
        setUncertainCommit(outcome.requiresReconciliation === true)
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
    } finally {
      inFlight.current = false
      setWorking(false)
    }
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
    <div
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-y-auto"
      aria-busy={busy}
    >
      <BulkImportHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        backHref={backHref}
        backLabel={backLabel}
      >
        <Button variant="outline" disabled={isDownloadingTemplate} onClick={onDownloadTemplate}>
          {isDownloadingTemplate ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          Mẫu XLSX
        </Button>
      </BulkImportHeader>

      <ol
        aria-label="Các bước nhập dữ liệu"
        className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {['Chọn tệp', 'Ghép cột', 'Kiểm tra', 'Kết quả'].map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? 'step' : undefined}
            className={cn(
              'border px-3 py-2 text-sm',
              step === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground'
            )}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <h2 ref={stepHeading} tabIndex={-1} className="sr-only" aria-live="polite">
        Bước {step + 1}: {['Chọn tệp', 'Ghép cột', 'Kiểm tra', 'Kết quả'][step]}
      </h2>

      {resultItems ? (
        <BulkImportResult
          entityLabel={entityLabel}
          listHref={backHref}
          listLabel={listLabel}
          resultFileName={resultFileName}
          items={resultItems}
          onRestart={resetSession}
        >
          <ImportResultTable items={resultItems} entityLabel={entityLabel} />
        </BulkImportResult>
      ) : inspection && options && !rows ? (
        <BulkImportMapping
          inspection={inspection}
          options={options}
          busy={busy}
          error={fileError}
          onChange={(options) => {
            setOptions(options)
            setAcceptedIgnored(false)
            setFileError(null)
          }}
          onBack={resetSession}
          onPreview={() => void handlePreview()}
        />
      ) : !rows ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          <Field className="sm:max-w-80">
            <FieldLabel htmlFor="bulk-import-delimiter">Dấu phân cách CSV</FieldLabel>
            <NativeSelect
              id="bulk-import-delimiter"
              value={delimiter}
              disabled={busy}
              onChange={(event) => setDelimiter(event.target.value)}
            >
              <NativeSelectOption value="auto">Tự nhận diện</NativeSelectOption>
              <NativeSelectOption value=",">Dấu phẩy (,)</NativeSelectOption>
              <NativeSelectOption value=";">Dấu chấm phẩy (;)</NativeSelectOption>
              <NativeSelectOption value={'\t'}>Tab</NativeSelectOption>
            </NativeSelect>
          </Field>
          <BulkImportFilePicker
            entityLabel={entityLabel}
            maxRows={maxRows}
            pending={busy}
            error={fileError}
            onFileChange={(file) => void handleFileChange(file)}
          />
          {file && fileError ? (
            <Button variant="outline" disabled={busy} onClick={() => void handleFileChange(file)}>
              Đọc lại tệp
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <section aria-label="Tổng quan bản xem trước" className="grid shrink-0 grid-cols-3 gap-2">
            <SummaryCard label="Tổng số dòng" value={rows.length} />
            <SummaryCard label="Hợp lệ" value={validRowNumbers.length} tone="success" />
            <SummaryCard label="Không hợp lệ" value={invalidCount} tone="danger" />
          </section>

          {importError ? (
            <Alert variant="destructive">
              <AlertTitle>Không thể nhập {entityLabel}</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
              {uncertainCommit ? (
                <p>
                  Chưa xác định kết quả lưu. Hãy kiểm tra danh sách {entityLabel} trước khi bắt đầu
                  phiên nhập mới để tránh nhập trùng.
                </p>
              ) : (
                <Button variant="outline" disabled={busy} onClick={() => void handlePreview()}>
                  Kiểm tra lại dữ liệu
                </Button>
              )}
            </Alert>
          ) : null}

          {fileError ? (
            <Alert variant="destructive">
              <AlertTitle>Kiểm tra lại chưa thành công</AlertTitle>
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          ) : null}
          {hasIgnored && ignored ? (
            <Alert className="shrink-0 break-words">
              <AlertTitle>Dữ liệu không nhập</AlertTitle>
              <AlertDescription>
                {ignored.sheets.length ? <p>Trang tính: {ignored.sheets.join(', ')}.</p> : null}
                {ignored.columns.length ? (
                  <p>
                    Cột:{' '}
                    {ignored.columns
                      .map((column) => column.letter + ' — ' + (column.header || 'Không có tên'))
                      .join(', ')}
                    .
                  </p>
                ) : null}
                <Field orientation="horizontal">
                  <Checkbox
                    id="bulk-import-ignored"
                    checked={acceptedIgnored}
                    disabled={busy}
                    onCheckedChange={(value) => setAcceptedIgnored(value === true)}
                  />
                  <FieldLabel htmlFor="bulk-import-ignored">
                    Tôi đồng ý bỏ qua các trang tính/cột trên.
                  </FieldLabel>
                </Field>
              </AlertDescription>
            </Alert>
          ) : null}

          <OperationalListPanel
            aria-label="Bản xem trước nhập dữ liệu"
            className="min-h-96 shrink-0"
          >
            <CardHeader className="shrink-0 border-b p-3">
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="Chọn tất cả dòng hợp lệ"
                      checked={
                        areAllVisibleValidRowsSelected
                          ? true
                          : visibleValidRowNumbers.some((row) => selectedRows.includes(row))
                            ? 'indeterminate'
                            : false
                      }
                      disabled={busy || visibleValidRowNumbers.length === 0}
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
                            aria-describedby={
                              !isValid ? `party-import-errors-${row.rowNumber}` : undefined
                            }
                            disabled={busy || !isValid}
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
                        <TableCell
                          className="max-w-96 min-w-56 break-words whitespace-normal"
                          id={`party-import-errors-${row.rowNumber}`}
                        >
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
            <OperationalPagination
              page={page}
              pageSize={BULK_IMPORT_ROWS_PER_PAGE}
              totalCount={filteredRows.length}
              onPageChange={setPage}
              isPending={busy}
            />
          </OperationalListPanel>

          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (window.confirm('Hủy phiên nhập hiện tại?')) resetSession()
              }}
            >
              Hủy phiên nhập
            </Button>
            <Button
              variant="outline"
              disabled={busy || uncertainCommit}
              onClick={() => {
                setRows(null)
                setFileError(null)
                setImportError(null)
                setNeedsRecheck(false)
              }}
            >
              Quay lại ghép cột
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={
                    selectedRows.length === 0 ||
                    busy ||
                    needsRecheck ||
                    uncertainCommit ||
                    (hasIgnored && !acceptedIgnored)
                  }
                >
                  {isImporting ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : null}
                  Nhập {selectedRows.length} {entityLabel}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận nhập {entityLabel}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hệ thống sẽ nhập {selectedRows.length} dòng hợp lệ đã chọn.
                    {hasIgnored ? ' Các trang tính/cột đã xác nhận bỏ qua sẽ không được nhập.' : ''}
                    {invalidCount > 0
                      ? ` ${invalidCount} dòng không hợp lệ sẽ được bỏ qua; sửa tệp và tải lại để nhập các dòng đó.`
                      : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Quay lại kiểm tra</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={busy || needsRecheck || uncertainCommit}
                    onClick={() => void handleImport()}
                  >
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

function ImportResultTable({
  items,
  entityLabel,
}: {
  readonly items: readonly BulkImportResultItem[]
  readonly entityLabel: string
}) {
  const [page, setPage] = useState(1)
  const visibleItems = items.slice(
    (page - 1) * BULK_IMPORT_ROWS_PER_PAGE,
    page * BULK_IMPORT_ROWS_PER_PAGE
  )
  return (
    <OperationalListPanel aria-label="Kết quả nhập dữ liệu" className="min-h-64 shrink-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Dòng</TableHead>
            <TableHead>{entityLabel}</TableHead>
            <TableHead>Kết quả</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleItems.map((item) => (
            <TableRow key={item.rowNumber}>
              <TableCell className="tabular-nums">{item.rowNumber}</TableCell>
              <TableCell className="min-w-48 break-words">{item.label}</TableCell>
              <TableCell className="min-w-56">
                <Badge
                  variant={item.isImported ? 'default' : 'outline'}
                  className="whitespace-normal"
                >
                  {item.result}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <OperationalPagination
        page={page}
        pageSize={BULK_IMPORT_ROWS_PER_PAGE}
        totalCount={items.length}
        onPageChange={setPage}
      />
    </OperationalListPanel>
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
      <CardContent className="p-3">
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
