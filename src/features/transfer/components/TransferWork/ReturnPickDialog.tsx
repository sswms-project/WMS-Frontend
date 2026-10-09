import type { UseFormReturn } from 'react-hook-form'
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
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { TransferPickReturnFormValues } from '../../schemas/transfer-fulfillment.schema'
import type { TransferPickDetail } from '../../types/transfer.types'
import { formatTransferLocation } from '../../utils/transfer-location'
import { PickLineLabel, type LineScopedDialogProps } from './PickDialogParts'
import { ScanInput } from './ScanInput'

interface ReturnPickDialogProps extends LineScopedDialogProps {
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
                <PickLineLabel line={line} />
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
                    {formatTransferLocation(pick)}
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
                className="h-11"
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
