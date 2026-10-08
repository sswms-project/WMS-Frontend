import { TriangleAlert } from 'lucide-react'
import type { UseFormRegisterReturn, UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import type {
  TransferPickEscalateFormValues,
  TransferPickReturnFormValues,
  TransferPickSwitchFormValues,
} from '../../schemas/transfer-fulfillment.schema'
import {
  TRANSFER_PICK_REASONS,
  type TransferPickAlternative,
  type TransferPickDetail,
  type TransferPickSheetLine,
} from '../../types/transfer.types'
import { PICK_REASONS_SUGGESTING_COUNT, PICK_REASON_LABELS } from '../../utils/transfer-format'
import { ScanInput } from './ScanInput'

interface LineScoped {
  readonly line: TransferPickSheetLine | null
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
}

function describeLine(line: TransferPickSheetLine) {
  return (
    <>
      <span className="font-mono" translate="no">
        {line.sku}
      </span>{' '}
      · {line.productName}
    </>
  )
}

function PickReasonField({
  id,
  registration,
  error,
}: {
  readonly id: string
  readonly registration: UseFormRegisterReturn
  readonly error?: string
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>Lý do</FieldLabel>
      <NativeSelect id={id} className="h-11 w-full" {...registration}>
        {TRANSFER_PICK_REASONS.map((reason) => (
          <NativeSelectOption key={reason} value={reason}>
            {PICK_REASON_LABELS[reason]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldError>{error}</FieldError>
    </Field>
  )
}

interface PickSwitchDialogProps extends LineScoped {
  readonly form: UseFormReturn<TransferPickSwitchFormValues>
  readonly alternatives: readonly TransferPickAlternative[]
  readonly isLoadingAlternatives: boolean
  readonly isNonFefo: boolean
  readonly onSubmit: (values: TransferPickSwitchFormValues) => void
}

export function PickSwitchDialog({
  line,
  form,
  alternatives,
  isLoadingAlternatives,
  isNonFefo,
  isPending,
  onOpenChange,
  onSubmit,
}: PickSwitchDialogProps) {
  const errors = form.formState.errors
  const reasonCode = form.watch('reasonCode')
  return (
    <Dialog open={Boolean(line)} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        {line ? (
          <form noValidate className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Đổi vị trí hoặc lô lấy hàng</DialogTitle>
              <DialogDescription>{describeLine(line)}</DialogDescription>
            </DialogHeader>
            <Field data-invalid={Boolean(errors.toInventoryStockId)}>
              <FieldLabel htmlFor="switch-stock">Vị trí/lô thay thế</FieldLabel>
              <NativeSelect
                id="switch-stock"
                className="h-11 w-full"
                disabled={isLoadingAlternatives}
                {...form.register('toInventoryStockId')}
              >
                <NativeSelectOption value="">
                  {isLoadingAlternatives ? 'Đang tải…' : 'Chọn vị trí/lô (xếp theo FEFO)'}
                </NativeSelectOption>
                {alternatives.map((alternative) => (
                  <NativeSelectOption
                    key={alternative.inventoryStockId}
                    value={alternative.inventoryStockId}
                  >
                    {alternative.slotCode}
                    {alternative.lotNumber ? ` · lô ${alternative.lotNumber}` : ''}
                    {alternative.expiryDate
                      ? ` · HSD ${formatOperationalDate(alternative.expiryDate)}`
                      : ''}{' '}
                    · còn {formatQuantity(alternative.availableQuantity)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{errors.toInventoryStockId?.message}</FieldError>
            </Field>
            {isNonFefo ? (
              <Alert role="status">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>Lô này không theo FEFO</AlertTitle>
                <AlertDescription>
                  Có lô hết hạn sớm hơn đang còn hàng. Hãy chọn lý do phù hợp; việc này được ghi
                  lại.
                </AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={Boolean(errors.quantity)}>
              <FieldLabel htmlFor="switch-quantity">Số lượng chuyển</FieldLabel>
              <Input
                id="switch-quantity"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="h-11"
                aria-invalid={Boolean(errors.quantity)}
                {...form.register('quantity', { valueAsNumber: true })}
              />
              <FieldError>{errors.quantity?.message}</FieldError>
            </Field>
            <PickReasonField
              id="switch-reason"
              registration={form.register('reasonCode')}
              error={errors.reasonCode?.message}
            />
            {PICK_REASONS_SUGGESTING_COUNT.includes(reasonCode) ? (
              <p className="text-muted-foreground text-xs" role="status">
                Quản lý kho sẽ được báo và nên kiểm kê lại vị trí cũ. Hệ thống không tự điều chỉnh
                tồn hay đổi trạng thái chất lượng.
              </p>
            ) : null}
            <Field data-invalid={Boolean(errors.note)}>
              <FieldLabel htmlFor="switch-note">
                Ghi chú{reasonCode === 'Other' ? ' (bắt buộc)' : ''}
              </FieldLabel>
              <Textarea
                id="switch-note"
                rows={2}
                maxLength={500}
                aria-invalid={Boolean(errors.note)}
                {...form.register('note')}
              />
              <FieldError>{errors.note?.message}</FieldError>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button type="submit" className="h-11" disabled={isPending}>
                {isPending ? 'Đang đổi…' : 'Xác nhận đổi'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface PickEscalateDialogProps extends LineScoped {
  readonly form: UseFormReturn<TransferPickEscalateFormValues>
  readonly onSubmit: (values: TransferPickEscalateFormValues) => void
}

export function PickEscalateDialog({
  line,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: PickEscalateDialogProps) {
  const errors = form.formState.errors
  return (
    <Dialog open={Boolean(line)} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        {line ? (
          <form noValidate className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Báo quản lý</DialogTitle>
              <DialogDescription>
                {describeLine(line)}. Dòng này chuyển sang chờ quản lý; bạn tiếp tục các dòng khác.
              </DialogDescription>
            </DialogHeader>
            <PickReasonField
              id="escalate-reason"
              registration={form.register('reasonCode')}
              error={errors.reasonCode?.message}
            />
            <Field data-invalid={Boolean(errors.note)}>
              <FieldLabel htmlFor="escalate-note">Mô tả vấn đề</FieldLabel>
              <Textarea
                id="escalate-note"
                rows={3}
                maxLength={500}
                aria-invalid={Boolean(errors.note)}
                {...form.register('note')}
              />
              <FieldError>{errors.note?.message}</FieldError>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button type="submit" className="h-11" disabled={isPending}>
                {isPending ? 'Đang gửi…' : 'Gửi cho quản lý'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface ReturnPickDialogProps extends LineScoped {
  readonly form: UseFormReturn<TransferPickReturnFormValues>
  readonly picks: readonly TransferPickDetail[]
  readonly onScanSlot: (code: string) => void
  readonly scannedSlotError: string | null
  readonly onSubmit: (values: TransferPickReturnFormValues) => void
}

export function ReturnPickDialog({
  line,
  form,
  picks,
  isPending,
  scannedSlotError,
  onScanSlot,
  onOpenChange,
  onSubmit,
}: ReturnPickDialogProps) {
  const errors = form.formState.errors
  return (
    <Dialog open={Boolean(line)} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        {line ? (
          <form noValidate className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Trả hàng về vị trí</DialogTitle>
              <DialogDescription>
                {describeLine(line)}
                {line.pendingReturnQuantity > 0
                  ? ` · cần trả ${formatQuantity(line.pendingReturnQuantity)} ${line.baseUnitName}`
                  : ''}
              </DialogDescription>
            </DialogHeader>
            <Field data-invalid={Boolean(errors.pickDetailId)}>
              <FieldLabel htmlFor="return-pick">Lần lấy cần trả</FieldLabel>
              <NativeSelect
                id="return-pick"
                className="h-11 w-full"
                {...form.register('pickDetailId')}
              >
                {picks.map((pick) => (
                  <NativeSelectOption key={pick.id} value={pick.id}>
                    {pick.slotCode}
                    {pick.lotNumber ? ` · lô ${pick.lotNumber}` : ''} · đang giữ{' '}
                    {formatQuantity(
                      pick.pickedQuantity - pick.returnedQuantity - pick.dispatchedQuantity
                    )}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{errors.pickDetailId?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.quantity)}>
              <FieldLabel htmlFor="return-quantity">Số lượng trả</FieldLabel>
              <Input
                id="return-quantity"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="h-11"
                aria-invalid={Boolean(errors.quantity)}
                {...form.register('quantity', { valueAsNumber: true })}
              />
              <FieldError>{errors.quantity?.message}</FieldError>
            </Field>
            <ScanInput
              id="return-scan-slot"
              label="Quét mã vị trí để trả"
              confirmedValue={form.watch('scannedSlotCode') || undefined}
              error={scannedSlotError ?? errors.scannedSlotCode?.message ?? null}
              disabled={isPending}
              onScan={onScanSlot}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button type="submit" className="h-11" disabled={isPending}>
                {isPending ? 'Đang trả…' : 'Xác nhận trả hàng'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
