import { Split, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { TransferReceiptFormValues } from '../../schemas/transfer-fulfillment.schema'
import { TRANSFER_RECEIPT_REASONS } from '../../types/transfer.types'
import { RECEIPT_REASON_LABELS } from '../../utils/transfer-format'
import { ScanInput, type ScanResult } from './ScanInput'

interface ReceiveEntryCardProps {
  readonly index: number
  readonly form: UseFormReturn<TransferReceiptFormValues>
  readonly heading: string
  readonly lotLabel: string
  readonly dispatchedQuantity: number
  readonly baseUnitName: string
  readonly canRemove: boolean
  readonly disabled: boolean
  readonly isFindingSlot: boolean
  readonly onScanSlot: (index: number, code: string) => ScanResult
  readonly onScanProduct: (index: number, code: string) => ScanResult
  readonly onSplit: (index: number) => void
  readonly onRemove: (index: number) => void
}

const QUANTITY_FIELDS = [
  { name: 'goodQuantity', label: 'Nhận tốt' },
  { name: 'damagedQuantity', label: 'Hỏng' },
  { name: 'missingQuantity', label: 'Thiếu' },
] as const

export function ReceiveEntryCard({
  index,
  form,
  heading,
  lotLabel,
  dispatchedQuantity,
  baseUnitName,
  canRemove,
  disabled,
  isFindingSlot,
  onScanSlot,
  onScanProduct,
  onSplit,
  onRemove,
}: ReceiveEntryCardProps) {
  const errors = form.formState.errors.entries?.[index]
  const entry = form.watch(`entries.${index}`)
  const hasProblem = entry.damagedQuantity > 0 || entry.missingQuantity > 0
  const needsSlot = entry.goodQuantity > 0 || entry.damagedQuantity > 0
  const isSlotConfirmed = Boolean(entry.destinationSlotId)
  const isProductConfirmed = Boolean(entry.scannedProductCode)

  // Máy quét gõ vào ô đang focus nên con trỏ phải tự đi theo từng bước: vị trí → mã hàng → số lượng.
  useEffect(() => {
    if (isProductConfirmed) document.getElementById(`receive-goodQuantity-${index}`)?.focus()
  }, [isProductConfirmed, index])

  return (
    <article className="bg-card border" aria-label={`Khai báo nhận ${heading} ${lotLabel}`}>
      <header className="flex flex-wrap items-start justify-between gap-2 border-b p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{heading}</p>
          <p className="text-muted-foreground text-xs">{lotLabel}</p>
        </div>
        <p className="text-sm tabular-nums">
          Đã xuất lô này <strong>{formatQuantity(dispatchedQuantity)}</strong> {baseUnitName}
        </p>
      </header>
      <div className="grid gap-4 p-3">
        {needsSlot ? (
          <>
            <ScanInput
              id={`receive-slot-${index}`}
              autoFocus={index === 0}
              label="Quét mã vị trí cất hàng"
              confirmedValue={entry.destinationSlotId ? entry.scannedSlotCode : undefined}
              error={errors?.scannedSlotCode?.message ?? null}
              disabled={disabled}
              pending={isFindingSlot}
              onScan={(code) => onScanSlot(index, code)}
            />
            <ScanInput
              id={`receive-product-${index}`}
              focusWhen={isSlotConfirmed && !isProductConfirmed}
              label="Quét mã hàng (không bắt buộc)"
              confirmedValue={entry.scannedProductCode || undefined}
              error={errors?.scannedProductCode?.message ?? null}
              disabled={disabled}
              onScan={(code) => onScanProduct(index, code)}
            />
          </>
        ) : null}
        <div className="grid grid-cols-3 gap-2">
          {QUANTITY_FIELDS.map((quantityField) => {
            const error = errors?.[quantityField.name]
            const inputId = `receive-${quantityField.name}-${index}`
            return (
              <Field key={quantityField.name} data-invalid={Boolean(error)}>
                <FieldLabel htmlFor={inputId}>{quantityField.label}</FieldLabel>
                <Input
                  id={inputId}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="h-11 text-base tabular-nums"
                  disabled={disabled}
                  aria-invalid={Boolean(error)}
                  {...form.register(`entries.${index}.${quantityField.name}`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>
            )
          })}
        </div>
        {errors?.goodQuantity?.message ||
        errors?.damagedQuantity?.message ||
        errors?.missingQuantity?.message ? (
          <FieldError>
            {errors.goodQuantity?.message ??
              errors.damagedQuantity?.message ??
              errors.missingQuantity?.message}
          </FieldError>
        ) : null}
        {hasProblem ? (
          <>
            <Field data-invalid={Boolean(errors?.reasonCode)}>
              <FieldLabel htmlFor={`receive-reason-${index}`}>Nguyên nhân hỏng/thiếu</FieldLabel>
              <NativeSelect
                id={`receive-reason-${index}`}
                className="h-11 w-full"
                disabled={disabled}
                {...form.register(`entries.${index}.reasonCode`)}
              >
                <NativeSelectOption value="">Chọn nguyên nhân</NativeSelectOption>
                {TRANSFER_RECEIPT_REASONS.map((reason) => (
                  <NativeSelectOption key={reason} value={reason}>
                    {RECEIPT_REASON_LABELS[reason]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{errors?.reasonCode?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors?.note)}>
              <FieldLabel htmlFor={`receive-note-${index}`}>Ghi chú</FieldLabel>
              <Textarea
                id={`receive-note-${index}`}
                rows={2}
                maxLength={500}
                disabled={disabled}
                {...form.register(`entries.${index}.note`)}
              />
              <FieldError>{errors?.note?.message}</FieldError>
            </Field>
          </>
        ) : null}
      </div>
      <footer className="flex flex-wrap justify-end gap-2 border-t p-3">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={disabled}
          onClick={() => onSplit(index)}
        >
          <Split aria-hidden="true" />
          Chia sang vị trí khác
        </Button>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            disabled={disabled}
            onClick={() => onRemove(index)}
          >
            <Trash2 aria-hidden="true" />
            Bỏ khai báo này
          </Button>
        ) : null}
      </footer>
    </article>
  )
}
