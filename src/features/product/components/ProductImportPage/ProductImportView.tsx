'use client'
import type { UseFormReturn } from 'react-hook-form'
import { BulkImportHeader } from '@/components/operations/BulkImportHeader'
import { BulkImportFilePicker } from '@/components/operations/BulkImportFilePicker'
import { BulkImportResult } from '@/components/operations/BulkImportResult'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { APP_ROUTES } from '@/routes/app-routes'
import { getApiErrorMessage } from '@/lib/api-error'
import { ProductImportMapping } from './ProductImportMapping'
import { ProductImportReview } from './ProductImportReview'
import type { ProductImportReviewFilters } from './ProductImportReview'
import type { ProductImportFormValues } from '../../schemas/product-import.schema'
import type {
  ProductImportInspect,
  ProductImportPreview,
  ProductImportPreviewRow,
  ProductImportOptions,
} from '../../types/product-import.types'
import { productImportResult } from '../../utils/product-import'

interface ProductImportViewProps {
  readonly view: ProductImportReviewFilters
  readonly onViewChange: (view: ProductImportReviewFilters) => void
  readonly step: 'file' | 'mapping' | 'review' | 'result'
  readonly file: File | null
  readonly busy: boolean
  readonly commit: { isPending: boolean }
  readonly inspect: { data?: ProductImportInspect; isError: boolean; error: unknown }
  readonly preview: { isError: boolean; error: unknown }
  readonly data: ProductImportPreview | undefined
  readonly form: UseFormReturn<ProductImportFormValues>
  readonly fileError: string | null
  readonly commitError: string | null
  readonly delimiter: ProductImportOptions['csvDelimiter']
  readonly selected: readonly number[]
  readonly importedRows: readonly number[]
  readonly rowsToImport: readonly ProductImportPreviewRow[]
  readonly conversionCount: number
  readonly confirmationOpen: boolean
  readonly revision: number
  readonly downloadTemplate: (variant: 'basic' | 'full') => Promise<void>
  readonly chooseFile: (file: File) => void
  readonly reset: () => void
  readonly checkData: () => Promise<void>
  readonly confirmImport: () => Promise<void>
  readonly exportReport: () => void
  readonly invalidatePreview: () => void
  readonly setDelimiter: (delimiter: ProductImportOptions['csvDelimiter']) => void
  readonly setStep: (step: 'file' | 'mapping' | 'review' | 'result') => void
  readonly setSelection: (rows: number[]) => void
  readonly setConfirmationOpen: (open: boolean) => void
  readonly onRetryInspection: () => void
}

export function ProductImportView({
  view,
  onViewChange,
  step,
  file,
  busy,
  commit,
  inspect,
  preview,
  data,
  form,
  fileError,
  commitError,
  delimiter,
  selected,
  importedRows,
  rowsToImport,
  conversionCount,
  confirmationOpen,
  revision,
  downloadTemplate,
  chooseFile,
  reset,
  checkData,
  confirmImport,
  exportReport,
  invalidatePreview,
  setDelimiter,
  setStep,
  setSelection,
  setConfirmationOpen,
  onRetryInspection,
}: ProductImportViewProps) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3">
      <BulkImportHeader
        eyebrow="Danh mục"
        title="Nhập vật tư hàng hóa"
        backHref={APP_ROUTES.products}
        backLabel="Về danh sách vật tư hàng hóa"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void downloadTemplate('basic')}>
            Mẫu cơ bản
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void downloadTemplate('full')}>
            Mẫu có quy đổi
          </Button>
        </div>
      </BulkImportHeader>
      <p role="status" className="text-muted-foreground shrink-0 text-sm">
        {busy
          ? commit.isPending
            ? 'Đang nhập dữ liệu…'
            : 'Đang kiểm tra…'
          : `Bước ${step === 'file' ? '1: Chọn tệp' : step === 'mapping' ? '2: Ghép cột' : step === 'review' ? '3: Kiểm tra' : '4: Kết quả'}`}
        {file ? ` · ${file.name}` : ''}
      </p>
      {step === 'file' ? (
        <>
          <Field>
            <FieldLabel htmlFor="import-csv-delimiter">Dấu phân cách CSV</FieldLabel>
            <NativeSelect
              id="import-csv-delimiter"
              value={delimiter}
              disabled={busy}
              onChange={(event) =>
                setDelimiter(event.target.value as ProductImportOptions['csvDelimiter'])
              }
            >
              <NativeSelectOption value="auto">Tự nhận diện</NativeSelectOption>
              <NativeSelectOption value=",">Dấu phẩy (,)</NativeSelectOption>
              <NativeSelectOption value=";">Dấu chấm phẩy (;)</NativeSelectOption>
              <NativeSelectOption value={'\t'}>Tab</NativeSelectOption>
            </NativeSelect>
          </Field>
          <BulkImportFilePicker
            entityLabel="vật tư hàng hóa"
            maxRows={500}
            pending={busy}
            error={fileError}
            onFileChange={chooseFile}
          />
        </>
      ) : null}
      {inspect.isError || preview.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Không thể kiểm tra tệp</AlertTitle>
          <AlertDescription>{getApiErrorMessage(inspect.error ?? preview.error)}</AlertDescription>
          <Button variant="outline" disabled={busy} onClick={onRetryInspection}>
            Thử kiểm tra lại
          </Button>
        </Alert>
      ) : null}
      {step === 'mapping' && inspect.data ? (
        <ProductImportMapping
          inspect={inspect.data}
          form={form}
          pending={busy}
          onChange={invalidatePreview}
          onPreview={() => void checkData()}
        />
      ) : null}
      {step === 'mapping' && file?.name.toLowerCase().endsWith('.csv') ? (
        <Field>
          <FieldLabel htmlFor="import-csv-change">Dấu phân cách CSV</FieldLabel>
          <NativeSelect
            id="import-csv-change"
            disabled={busy}
            value={delimiter}
            onChange={(event) => {
              invalidatePreview()
              setDelimiter(event.target.value as ProductImportOptions['csvDelimiter'])
            }}
          >
            <NativeSelectOption value="auto">Tự nhận diện</NativeSelectOption>
            <NativeSelectOption value=",">Dấu phẩy (,)</NativeSelectOption>
            <NativeSelectOption value=";">Dấu chấm phẩy (;)</NativeSelectOption>
            <NativeSelectOption value={'\t'}>Tab</NativeSelectOption>
          </NativeSelect>
        </Field>
      ) : null}
      {commitError ? (
        <Alert variant="destructive">
          <AlertTitle>Cần kiểm tra lại trước khi nhập</AlertTitle>
          <AlertDescription>{commitError}</AlertDescription>
          <Button variant="outline" disabled={busy} onClick={() => void checkData()}>
            Kiểm tra lại
          </Button>
        </Alert>
      ) : null}
      {step === 'review' && data ? (
        <ProductImportReview
          view={view}
          onViewChange={onViewChange}
          key={revision}
          preview={data}
          selected={selected}
          pending={busy}
          onSelectionChange={setSelection}
        />
      ) : null}
      {step === 'result' && data ? (
        <div className="min-h-0 overflow-auto">
          <p className="mb-2 text-sm" role="status">
            Đã nhập {importedRows.length} sản phẩm và {conversionCount} đơn vị quy đổi.
          </p>
          <BulkImportResult
            entityLabel="sản phẩm"
            listHref={APP_ROUTES.products}
            listLabel="Về danh sách"
            resultFileName="kovia-bao-cao-nhap-hang-hoa.csv"
            items={productImportResult(data, importedRows)}
            onRestart={reset}
            onExport={exportReport}
          />
        </div>
      ) : null}
      {file && step !== 'result' ? (
        <footer className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={reset}>
            Chọn tệp khác
          </Button>
          {step === 'review' ? (
            <Button variant="outline" disabled={busy} onClick={() => setStep('mapping')}>
              Quay lại ghép cột
            </Button>
          ) : null}
          {data && step === 'review' ? (
            <>
              <Button variant="outline" onClick={exportReport}>
                Xuất báo cáo toàn tệp
              </Button>
              <Button
                disabled={busy || Boolean(commitError) || !rowsToImport.length}
                onClick={() => setConfirmationOpen(true)}
              >
                Nhập {rowsToImport.length} sản phẩm
              </Button>
            </>
          ) : null}
        </footer>
      ) : null}
      <AlertDialog
        open={confirmationOpen}
        onOpenChange={(open) => {
          if (!commit.isPending) setConfirmationOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Nhập {rowsToImport.length} sản phẩm và {conversionCount} đơn vị quy đổi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(data?.rows.length ?? 0) - rowsToImport.length} sản phẩm không hợp lệ hoặc không được
              chọn sẽ không nhập.{' '}
              {[...(data?.warnings ?? []), ...(data?.rows.flatMap((row) => row.warnings) ?? [])]
                .map((issue) => issue.message)
                .join(' ')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={commit.isPending}>Quay lại kiểm tra</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || Boolean(commitError) || !rowsToImport.length}
              onClick={(event) => {
                event.preventDefault()
                void confirmImport()
              }}
            >
              Xác nhận nhập
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
