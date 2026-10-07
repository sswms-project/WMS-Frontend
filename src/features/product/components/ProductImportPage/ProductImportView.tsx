'use client'
import { useEffect, useRef } from 'react'
import { Check, Download, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import {
  productImportOptionsSchema,
  type ProductImportFormValues,
} from '../../schemas/product-import.schema'
import type {
  ProductImportInspect,
  ProductImportPreview,
  ProductImportPreviewRow,
  ProductImportOptions,
} from '../../types/product-import.types'
import { productImportResult } from '../../utils/product-import'
import { ProductImportResultTable } from './ProductImportResultTable'
import styles from './product-import.module.css'

const importSteps = [
  { key: 'file', label: 'Chọn tệp' },
  { key: 'mapping', label: 'Ghép cột' },
  { key: 'review', label: 'Kiểm tra' },
  { key: 'result', label: 'Kết quả' },
] as const

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
  const stepHeading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)
  const confirmButton = useRef<HTMLButtonElement>(null)
  const recheckButton = useRef<HTMLButtonElement>(null)
  const stepIndex = importSteps.findIndex((item) => item.key === step)
  const mappingValid = productImportOptionsSchema(inspect.data).safeParse(form.watch()).success
  const warnings = [...(data?.warnings ?? []), ...(data?.rows.flatMap((row) => row.warnings) ?? [])]
  useEffect(() => {
    if (previousStep.current !== step) stepHeading.current?.focus()
    previousStep.current = step
  }, [step])
  return (
    <div
      className={cn('flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3', styles.workspace)}
    >
      <BulkImportHeader
        eyebrow="Danh mục"
        title="Nhập vật tư hàng hóa"
        backHref={APP_ROUTES.products}
        backLabel="Về danh sách vật tư hàng hóa"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void downloadTemplate('basic')}>
            <Download data-icon="inline-start" aria-hidden="true" />
            Mẫu cơ bản
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void downloadTemplate('full')}>
            <Download data-icon="inline-start" aria-hidden="true" />
            Mẫu có quy đổi
          </Button>
        </div>
      </BulkImportHeader>
      <nav aria-label="Tiến trình nhập hàng hóa" className="shrink-0">
        <ol className="bg-card grid grid-cols-4 border">
          {importSteps.map((item, index) => (
            <li
              key={item.key}
              aria-current={step === item.key ? 'step' : undefined}
              className={cn(
                'flex min-w-0 items-center justify-center gap-2 border-b-2 border-b-transparent p-2 text-center text-xs sm:text-sm',
                step === item.key
                  ? 'border-b-primary bg-muted text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {index < stepIndex ? (
                <Check className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <span className="tabular-nums">{index + 1}</span>
              )}
              <span>{item.label}</span>
            </li>
          ))}
        </ol>
      </nav>
      <h2 ref={stepHeading} tabIndex={-1} className="sr-only">
        Bước {stepIndex + 1}: {importSteps[stepIndex]!.label}
      </h2>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs">
        <p
          role="status"
          aria-live="polite"
          className="text-muted-foreground flex items-center gap-2"
        >
          {busy ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : null}
          {busy
            ? commit.isPending
              ? 'Đang nhập dữ liệu…'
              : 'Đang kiểm tra…'
            : `Bước ${stepIndex + 1}: ${importSteps[stepIndex]!.label}`}
        </p>
        {file ? (
          <p className="max-w-full min-w-0 truncate" title={file.name}>
            {file.name} ·{' '}
            {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(file.size / 1024)}{' '}
            KB
          </p>
        ) : (
          <p className="text-muted-foreground">CSV không chứa đơn vị quy đổi.</p>
        )}
      </div>
      {step === 'file' ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <BulkImportFilePicker
            entityLabel="vật tư hàng hóa"
            maxRows={500}
            pending={busy}
            error={fileError}
            onFileChange={chooseFile}
          />
        </div>
      ) : null}
      {inspect.isError || preview.isError ? (
        <Alert variant="destructive" className="shrink-0">
          <AlertTitle>Không thể kiểm tra tệp</AlertTitle>
          <AlertDescription className="max-h-24 overflow-auto wrap-anywhere">
            {getApiErrorMessage(inspect.error ?? preview.error)}
          </AlertDescription>
          <Button variant="outline" disabled={busy} onClick={onRetryInspection}>
            Thử kiểm tra lại
          </Button>
        </Alert>
      ) : null}
      {step === 'mapping' && file?.name.toLowerCase().endsWith('.csv') ? (
        <Field className="shrink-0 sm:max-w-64">
          <FieldLabel htmlFor="import-csv-change">Dấu phân cách CSV</FieldLabel>
          <NativeSelect
            className="w-full"
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
      {step === 'mapping' && inspect.data ? (
        <ProductImportMapping
          inspect={inspect.data}
          form={form}
          pending={busy}
          onChange={invalidatePreview}
          onPreview={() => void checkData()}
        />
      ) : null}
      {(step === 'mapping' && !inspect.data) || (step === 'review' && !data) ? (
        <div
          className="bg-card flex min-h-24 flex-1 items-center justify-center border text-sm"
          role="status"
        >
          {busy ? 'Đang chuẩn bị dữ liệu…' : 'Chưa có dữ liệu. Hãy kiểm tra lại tệp.'}
        </div>
      ) : null}
      {commitError ? (
        <Alert variant="destructive" className="shrink-0">
          <AlertTitle>Cần kiểm tra lại trước khi nhập</AlertTitle>
          <AlertDescription className="max-h-24 overflow-auto wrap-anywhere">
            {commitError}
          </AlertDescription>
          <Button
            ref={recheckButton}
            variant="outline"
            disabled={busy}
            onClick={() => void checkData()}
          >
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
          onExport={exportReport}
        />
      ) : null}
      {step === 'result' && data ? (
        <>
          <p className="shrink-0 text-sm" role="status">
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
          >
            <ProductImportResultTable
              preview={data}
              importedRows={importedRows}
              view={view}
              onViewChange={onViewChange}
            />
          </BulkImportResult>
        </>
      ) : null}
      {file && step !== 'result' ? (
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-2">
          {step === 'review' ? (
            <p className="mr-auto text-xs tabular-nums">
              Nhập {rowsToImport.length} sản phẩm · {conversionCount} quy đổi
            </p>
          ) : null}
          <Button variant="outline" disabled={busy} onClick={reset}>
            Chọn tệp khác
          </Button>
          {step === 'mapping' ? (
            <Button type="submit" form="product-import-mapping" disabled={busy || !mappingValid}>
              Kiểm tra dữ liệu
            </Button>
          ) : null}
          {step === 'mapping' && inspect.data && !mappingValid ? (
            <p className="text-muted-foreground basis-full text-right text-xs">
              Ghép đủ cột bắt buộc, không trùng cột, và chọn dòng tiêu đề 1–50.
            </p>
          ) : null}
          {step === 'review' ? (
            <Button variant="outline" disabled={busy} onClick={() => setStep('mapping')}>
              Quay lại ghép cột
            </Button>
          ) : null}
          {data && step === 'review' ? (
            <>
              <Button
                ref={confirmButton}
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
        <AlertDialogContent
          className={cn('max-h-[calc(100dvh-2rem)] overflow-y-auto', styles.confirmation)}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (step === 'result') stepHeading.current?.focus()
            else if (commitError) recheckButton.current?.focus()
            else confirmButton.current?.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Nhập {rowsToImport.length} sản phẩm và {conversionCount} đơn vị quy đổi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(data?.rows.length ?? 0) - rowsToImport.length} sản phẩm không hợp lệ hoặc không được
              chọn sẽ không nhập. Toàn bộ sản phẩm được chọn và quy đổi tương ứng sẽ được lưu cùng
              một lần.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {warnings.length ? (
            <details open className="min-w-0 text-sm">
              <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">
                {warnings.length} cảnh báo cần lưu ý trước khi nhập
              </summary>
              <ul className="mt-2 flex max-h-48 flex-col gap-2 overflow-auto wrap-anywhere whitespace-normal">
                {warnings.map((issue, index) => (
                  <li key={index}>{issue.message}</li>
                ))}
              </ul>
            </details>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={commit.isPending}>Quay lại kiểm tra</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || Boolean(commitError) || !rowsToImport.length}
              onClick={(event) => {
                event.preventDefault()
                void confirmImport()
              }}
            >
              {commit.isPending ? 'Đang nhập…' : 'Xác nhận nhập'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
