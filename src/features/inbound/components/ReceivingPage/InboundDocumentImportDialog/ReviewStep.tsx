import { AlertCircle, CheckCircle2, Save, Sparkles, TriangleAlert } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/purchase-order/utils/purchase-order-format'
import type { InboundDocumentReviewFormValues } from '../../../schemas/inbound-document-import.schema'
import type {
  InboundDocumentImport,
  ReceivingTask,
  SupplierDocumentLineExtraction,
} from '../../../types/inbound.types'

interface ReviewStepProps {
  readonly task: ReceivingTask
  readonly importData: InboundDocumentImport
  readonly form: UseFormReturn<InboundDocumentReviewFormValues>
  readonly isSavingReview: boolean
  readonly isCreatingDraft: boolean
  readonly onSaveReview: () => void
  readonly onCreateDraft: () => void
}

function StatusBadges({
  status,
  isUserCorrected,
}: {
  readonly status: string
  readonly isUserCorrected: boolean
}) {
  const statusBadge =
    status === 'Matched' ? (
      <Badge variant="secondary">
        <CheckCircle2 aria-hidden="true" />
        Khớp
      </Badge>
    ) : status === 'Shortage' ? (
      <Badge variant="outline">
        <TriangleAlert aria-hidden="true" />
        Giao thiếu
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle aria-hidden="true" />
        Cần xử lý
      </Badge>
    )

  return (
    <div className="flex flex-col items-start gap-1">
      {statusBadge}
      {isUserCorrected ? <Badge variant="outline">Đã hiệu chỉnh</Badge> : null}
    </div>
  )
}

const SOURCE_LABELS = {
  AiExtracted: 'AI trích xuất',
  DocumentParser: 'Đọc từ tệp',
  PurchaseOrder: 'Đơn mua',
  SupplierMaster: 'Danh mục NCC',
  WarehouseMaster: 'Danh mục kho',
  SystemGenerated: 'Hệ thống',
  UserEdited: 'Người dùng sửa',
} as const

const VERIFICATION_LABELS = {
  Unverified: 'Chưa xác nhận',
  Matched: 'Đã đối chiếu',
  LowConfidence: 'Cần kiểm tra',
  Mismatch: 'Không khớp',
  UserConfirmed: 'Đã xác nhận',
  UserCorrected: 'Đã hiệu chỉnh',
  NotProvided: 'Không có dữ liệu',
} as const

function DocumentQuantityCell({
  item,
  fallback,
}: {
  readonly item: SupplierDocumentLineExtraction | undefined
  readonly fallback: number
}) {
  const quantity = item?.deliveredQuantity
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="tabular-nums">{quantity?.rawValue ?? formatQuantity(fallback)}</span>
      {quantity ? (
        <span className="text-muted-foreground text-[11px]">
          {SOURCE_LABELS[quantity.source]} · {VERIFICATION_LABELS[quantity.verificationStatus]}
        </span>
      ) : null}
    </div>
  )
}

export function ReviewStep({
  task,
  importData,
  form,
  isSavingReview,
  isCreatingDraft,
  onSaveReview,
  onCreateDraft,
}: ReviewStepProps) {
  const review = importData.review
  if (!review) return null
  const errors = form.formState.errors
  const hasUnsavedChanges = form.formState.isDirty
  const isPending = isSavingReview || isCreatingDraft
  const needsWarehouseAcknowledgement =
    review.hasWarehouseMismatch && !review.warehouseMismatchAcknowledged

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <section className="bg-muted flex flex-col gap-2 border p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-tertiary" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Chứng từ đã trích xuất</h3>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Tệp</dt>
            <dd className="truncate">{importData.fileName}</dd>
            <dt className="text-muted-foreground">Số chứng từ</dt>
            <dd>{review.extraction.documentNumber?.value ?? 'Không có'}</dd>
            <dt className="text-muted-foreground">Nhà cung cấp</dt>
            <dd>{review.extraction.supplierName?.value ?? 'Không có'}</dd>
            <dt className="text-muted-foreground">Nguồn</dt>
            <dd>{importData.extractionProvider ?? 'Không xác định'}</dd>
          </dl>
        </section>
        <section className="bg-card flex flex-col gap-2 border p-3">
          <h3 className="text-sm font-semibold">Dữ liệu WMS có thẩm quyền</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Đơn mua</dt>
            <dd className="font-mono">{review.purchaseOrderNumber}</dd>
            <dt className="text-muted-foreground">Nhà cung cấp</dt>
            <dd>{review.supplierName}</dd>
            <dt className="text-muted-foreground">Kho nhận</dt>
            <dd>{review.warehouseName}</dd>
            <dt className="text-muted-foreground">Ngày dự kiến</dt>
            <dd>{formatOperationalDate(review.expectedReceiptDate)}</dd>
          </dl>
        </section>
      </div>

      {review.blockingErrors.map((message) => (
        <Alert key={message} variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Lỗi cần xử lý</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ))}
      {review.warnings.map((message) => (
        <Alert key={message}>
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Cảnh báo</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ))}

      {review.hasWarehouseMismatch ? (
        <Alert>
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Kho trên chứng từ khác với đơn mua</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <div className="grid gap-1 sm:grid-cols-2">
              <p>
                Chứng từ:{' '}
                <strong>
                  {review.extraction.warehouseCode?.value ?? 'Không có mã'} ·{' '}
                  {review.extraction.warehouseName?.value ?? 'Không có tên'}
                </strong>
              </p>
              <p>
                Kho của PO:{' '}
                <strong>
                  {review.warehouseCode ?? 'Không có mã'} · {review.warehouseName}
                </strong>
              </p>
            </div>
            <Controller
              control={form.control}
              name="acknowledgeWarehouseMismatch"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="acknowledge-warehouse-mismatch"
                    checked={field.value}
                    disabled={isPending}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="acknowledge-warehouse-mismatch">
                      Tôi xác nhận sử dụng {review.warehouseCode} · {review.warehouseName} theo đơn
                      mua.
                    </FieldLabel>
                    <FieldDescription>
                      Nội dung AI chỉ dùng để đối chiếu; hệ thống không thay đổi kho nhận của PO.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" {...form.register('purchaseOrderId')} />
      <div className="max-h-[42dvh] overflow-auto border">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card sticky top-0 z-10">Dòng chứng từ</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Dòng đơn mua</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 text-right">Còn lại</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 text-right">SL chứng từ</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 text-right">SL xác nhận</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 text-right">SL hỏng</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Tình trạng hàng hỏng</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {review.lines.map((line, index) => (
              <TableRow key={line.sourceLineNumber}>
                <TableCell>
                  <input
                    type="hidden"
                    {...form.register(`lines.${index}.sourceLineNumber`, { valueAsNumber: true })}
                  />
                  <p className="font-mono text-xs">
                    {line.extractedSku ?? `Dòng ${line.sourceLineNumber}`}
                  </p>
                  <p className="text-muted-foreground max-w-48 truncate text-xs">
                    {line.extractedProductName}
                  </p>
                </TableCell>
                <TableCell>
                  <Field data-invalid={Boolean(errors.lines?.[index]?.purchaseOrderItemId)}>
                    <FieldLabel className="sr-only" htmlFor={`po-line-${index}`}>
                      Dòng đơn mua
                    </FieldLabel>
                    <NativeSelect
                      id={`po-line-${index}`}
                      className="w-64"
                      aria-invalid={Boolean(errors.lines?.[index]?.purchaseOrderItemId)}
                      {...form.register(`lines.${index}.purchaseOrderItemId`)}
                    >
                      <NativeSelectOption value="">Chọn sản phẩm</NativeSelectOption>
                      {task.lines.map((option) => (
                        <NativeSelectOption
                          key={option.purchaseOrderItemId}
                          value={option.purchaseOrderItemId}
                        >
                          {option.productSKU} · {option.productName}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError>{errors.lines?.[index]?.purchaseOrderItemId?.message}</FieldError>
                  </Field>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(line.remainingQuantity)}
                </TableCell>
                <TableCell className="text-right">
                  <DocumentQuantityCell
                    item={review.extraction.items.find(
                      (item) => item.sourceLineNumber === line.sourceLineNumber
                    )}
                    fallback={line.documentQuantity ?? 0}
                  />
                </TableCell>
                <TableCell>
                  <Field data-invalid={Boolean(errors.lines?.[index]?.confirmedQuantity)}>
                    <FieldLabel className="sr-only" htmlFor={`confirmed-${index}`}>
                      Số lượng xác nhận
                    </FieldLabel>
                    <Input
                      id={`confirmed-${index}`}
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      min="0.01"
                      step="0.01"
                      className="ml-auto w-28 text-right"
                      aria-invalid={Boolean(errors.lines?.[index]?.confirmedQuantity)}
                      {...form.register(`lines.${index}.confirmedQuantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError>{errors.lines?.[index]?.confirmedQuantity?.message}</FieldError>
                  </Field>
                </TableCell>
                <TableCell>
                  <Field data-invalid={Boolean(errors.lines?.[index]?.damagedQuantity)}>
                    <FieldLabel className="sr-only" htmlFor={`damaged-import-${index}`}>
                      Số lượng hỏng
                    </FieldLabel>
                    <Input
                      id={`damaged-import-${index}`}
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      min="0"
                      step="0.01"
                      className="ml-auto w-24 text-right"
                      aria-invalid={Boolean(errors.lines?.[index]?.damagedQuantity)}
                      {...form.register(`lines.${index}.damagedQuantity`, { valueAsNumber: true })}
                    />
                    <FieldError>{errors.lines?.[index]?.damagedQuantity?.message}</FieldError>
                  </Field>
                </TableCell>
                <TableCell>
                  <Field data-invalid={Boolean(errors.lines?.[index]?.exceptionReason)}>
                    <FieldLabel className="sr-only" htmlFor={`exception-import-${index}`}>
                      Tình trạng hàng hỏng
                    </FieldLabel>
                    <Input
                      id={`exception-import-${index}`}
                      className="w-56"
                      autoComplete="off"
                      placeholder="Ví dụ: vỡ thùng…"
                      aria-invalid={Boolean(errors.lines?.[index]?.exceptionReason)}
                      {...form.register(`lines.${index}.exceptionReason`)}
                    />
                    <FieldError>{errors.lines?.[index]?.exceptionReason?.message}</FieldError>
                  </Field>
                </TableCell>
                <TableCell>
                  <StatusBadges status={line.status} isUserCorrected={line.isUserCorrected} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isPending} onClick={onSaveReview}>
          {isSavingReview ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Lưu và kiểm tra lại
        </Button>
        <Button
          type="button"
          title={
            hasUnsavedChanges
              ? 'Lưu và kiểm tra lại các thay đổi trước khi tạo phiếu.'
              : needsWarehouseAcknowledgement
                ? 'Xác nhận sử dụng kho của đơn mua để tiếp tục.'
                : undefined
          }
          disabled={
            isPending ||
            hasUnsavedChanges ||
            importData.status !== 'ReadyForDraft' ||
            !review.canCreateDraft
          }
          onClick={onCreateDraft}
        >
          {isCreatingDraft ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <CheckCircle2 data-icon="inline-start" />
          )}
          Tạo phiếu nhập nháp
        </Button>
      </div>
    </div>
  )
}
