'use client'

import { Download, FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
  hasBulkImportExtension,
} from './bulk-import'

export interface BulkImportRow {
  readonly rowNumber: number
  readonly errors: readonly string[]
}

export type BulkImportPreviewOutcome<TRow extends BulkImportRow> =
  | { readonly isSucceeded: true; readonly rows: readonly TRow[] }
  | { readonly isSucceeded: false; readonly message: string }

export interface BulkImportColumn<TRow extends BulkImportRow> {
  readonly key: string
  readonly header: string
  readonly headClassName?: string
  readonly cellClassName?: string
  readonly render: (row: TRow) => ReactNode
}

interface BulkImportDialogProps<TRow extends BulkImportRow> {
  readonly open: boolean
  readonly isPreviewing: boolean
  readonly isImporting: boolean
  readonly isDownloadingTemplate: boolean
  readonly errorMessage: string | null
  readonly title: string
  readonly description: string
  readonly entityLabel: string
  readonly columns: readonly BulkImportColumn<TRow>[]
  readonly onOpenChange: (open: boolean) => void
  readonly onDownloadTemplate: () => void
  readonly onPreview: (file: File) => Promise<BulkImportPreviewOutcome<TRow>>
  readonly onImport: (rows: readonly TRow[]) => Promise<boolean>
}

export function BulkImportDialog<TRow extends BulkImportRow>({
  open,
  isPreviewing,
  isImporting,
  isDownloadingTemplate,
  errorMessage,
  title,
  description,
  entityLabel,
  columns,
  onOpenChange,
  onDownloadTemplate,
  onPreview,
  onImport,
}: BulkImportDialogProps<TRow>) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [rows, setRows] = useState<readonly TRow[] | null>(null)

  const isBusy = isPreviewing || isImporting
  const invalidCount = rows?.filter((row) => row.errors.length > 0).length ?? 0
  const canImport = rows !== null && rows.length > 0 && invalidCount === 0

  function reset() {
    setFileName(null)
    setFileError(null)
    setRows(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isBusy) return
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  async function handleFileChange(file: File | null) {
    setRows(null)
    setFileError(null)
    setFileName(file?.name ?? null)
    if (!file) return
    if (!hasBulkImportExtension(file.name)) {
      setFileError(`Chỉ hỗ trợ tệp ${BULK_IMPORT_FILE_EXTENSIONS.join(' hoặc ')}.`)
      return
    }
    if (file.size > BULK_IMPORT_MAX_FILE_BYTES) {
      setFileError(`Tệp vượt quá ${BULK_IMPORT_MAX_FILE_MB} MB.`)
      return
    }

    const outcome = await onPreview(file)
    if (outcome.isSucceeded) setRows(outcome.rows)
    else setFileError(outcome.message)
  }

  async function handleImport() {
    if (!rows || !canImport) return
    const isSucceeded = await onImport(rows)
    if (isSucceeded) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            className="self-start"
            disabled={isDownloadingTemplate}
            onClick={onDownloadTemplate}
          >
            {isDownloadingTemplate ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Download data-icon="inline-start" aria-hidden="true" />
            )}
            Tải tệp mẫu Excel
          </Button>

          <Field data-invalid={Boolean(fileError)}>
            <FieldLabel htmlFor="bulk-import-file">Tệp {entityLabel}</FieldLabel>
            <Input
              id="bulk-import-file"
              type="file"
              accept={BULK_IMPORT_FILE_EXTENSIONS.join(',')}
              disabled={isBusy}
              aria-invalid={Boolean(fileError)}
              onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
            />
            <FieldDescription>
              Excel (.xlsx) hoặc CSV · tối đa {BULK_IMPORT_MAX_FILE_MB} MB
            </FieldDescription>
            <FieldError>{fileError}</FieldError>
          </Field>

          {isPreviewing ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm" role="status">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Đang kiểm tra tệp…
            </p>
          ) : null}

          {rows ? (
            <section aria-label="Xem trước dữ liệu nhập" className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <FileSpreadsheet aria-hidden="true" className="size-4" />
                <span className="font-medium">{fileName}</span>
                <Badge variant="secondary">{rows.length} dòng</Badge>
                {invalidCount > 0 ? (
                  <Badge variant="destructive">{invalidCount} dòng lỗi</Badge>
                ) : (
                  <Badge variant="secondary">Dữ liệu hợp lệ</Badge>
                )}
              </div>
              <div className="max-h-72 overflow-auto border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Dòng</TableHead>
                      {columns.map((column) => (
                        <TableHead key={column.key} className={column.headClassName}>
                          {column.header}
                        </TableHead>
                      ))}
                      <TableHead>Kiểm tra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="tabular-nums">{row.rowNumber}</TableCell>
                        {columns.map((column) => (
                          <TableCell key={column.key} className={column.cellClassName}>
                            {column.render(row)}
                          </TableCell>
                        ))}
                        <TableCell
                          className={row.errors.length > 0 ? 'text-destructive' : undefined}
                        >
                          {row.errors.length > 0 ? row.errors.join(' ') : 'Hợp lệ'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="text-destructive text-sm">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="button" disabled={!canImport || isBusy} onClick={() => void handleImport()}>
            {isImporting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload data-icon="inline-start" aria-hidden="true" />
            )}
            {canImport ? `Nhập ${rows?.length} ${entityLabel}` : 'Nhập dữ liệu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
