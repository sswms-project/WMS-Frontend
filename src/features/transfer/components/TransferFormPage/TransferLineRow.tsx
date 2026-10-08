import { Trash2 } from 'lucide-react'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { LookupCombobox } from '@/features/inbound-request/components/InboundRequestFormPage/LookupCombobox'
import type { LookupOption } from '@/features/inbound-request/types/inbound-request.types'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { TransferRequestFormValues } from '../../schemas/transfer-request.schema'
import type { TransferAvailability } from '../../types/transfer.types'

export interface TransferLineLockInfo {
  /** Phần đã xuất (theo ĐVT đã chọn) không được sửa. */
  readonly dispatched: number
  readonly unitName: string
}

interface TransferLineRowProps {
  readonly field: FieldArrayWithId<TransferRequestFormValues, 'lines', 'id'>
  readonly index: number
  readonly lineCount: number
  readonly form: UseFormReturn<TransferRequestFormValues>
  readonly availability?: TransferAvailability
  readonly selectedOption?: LookupOption
  readonly options: readonly LookupOption[]
  readonly isProductSearchLoading: boolean
  /** Dòng đã gửi: không đổi được sản phẩm và đơn vị tính, chỉ đổi số lượng hoặc bỏ dòng. */
  readonly isIdentityLocked: boolean
  readonly lockInfo?: TransferLineLockInfo
  readonly showAvailabilityWarning: boolean
  readonly onProductSearchChange: (scope: string, value: string) => void
  readonly onRemove: (index: number) => void
}

export function TransferLineRow({
  field,
  index,
  lineCount,
  form,
  availability,
  selectedOption,
  options,
  isProductSearchLoading,
  isIdentityLocked,
  lockInfo,
  showAvailabilityWarning,
  onProductSearchChange,
  onRemove,
}: TransferLineRowProps) {
  const line = form.watch(`lines.${index}`)
  const errors = form.formState.errors.lines?.[index]
  const units = availability?.units ?? []
  const selectedUnitId = line.unitId || availability?.baseUnitId || ''
  const selectedUnit = units.find((unit) => unit.unitId === selectedUnitId)
  const factor = selectedUnit?.conversionFactor
  const baseQuantity = factor !== undefined ? line.quantity * factor : Number.NaN
  const availableInUnit = selectedUnit?.availableQuantity
  const exceedsAvailability =
    showAvailabilityWarning &&
    availableInUnit !== undefined &&
    Number.isFinite(line.quantity) &&
    line.quantity > availableInUnit

  return (
    <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[28px_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_32px] lg:items-start lg:gap-3 lg:px-3 lg:py-2">
      <div className="flex items-center justify-between lg:justify-center lg:pt-2">
        <span className="text-muted-foreground text-xs">{index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label={`Xóa dòng ${index + 1}`}
          disabled={lineCount === 1}
          onClick={() => onRemove(index)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
      <Field data-invalid={Boolean(errors?.productId)}>
        <FieldLabel className="text-xs lg:sr-only" htmlFor={`transfer-product-${index}`}>
          Sản phẩm
        </FieldLabel>
        <LookupCombobox
          id={`transfer-product-${index}`}
          value={line.productId}
          options={options}
          selectedOption={selectedOption}
          placeholder="Chọn hoặc tìm sản phẩm"
          emptyMessage="Không tìm thấy sản phẩm phù hợp."
          ariaLabel={`Sản phẩm dòng ${index + 1}`}
          isLoading={isProductSearchLoading}
          isInvalid={Boolean(errors?.productId)}
          disabled={isIdentityLocked}
          onSearchChange={(value) => onProductSearchChange(field.id, value)}
          onChange={(value) => {
            form.setValue(`lines.${index}.productId`, value, {
              shouldDirty: true,
              shouldValidate: true,
            })
            form.setValue(`lines.${index}.unitId`, '', { shouldDirty: true })
          }}
        />
        <FieldError>{errors?.productId?.message}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.unitId)}>
        <FieldLabel className="text-xs lg:sr-only" htmlFor={`transfer-unit-${index}`}>
          Đơn vị tính
        </FieldLabel>
        <NativeSelect
          id={`transfer-unit-${index}`}
          className="w-full"
          disabled={!availability || isIdentityLocked}
          value={selectedUnitId}
          onChange={(event) =>
            form.setValue(`lines.${index}.unitId`, event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          {units.length === 0 ? (
            <NativeSelectOption value="">Chọn sản phẩm trước</NativeSelectOption>
          ) : null}
          {units.map((unit) => (
            <NativeSelectOption key={unit.unitId} value={unit.unitId}>
              {unit.unitName}
              {unit.conversionFactor !== 1 ? ` (×${formatQuantity(unit.conversionFactor)})` : ''}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError>{errors?.unitId?.message}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.quantity)}>
        <FieldLabel className="text-xs lg:sr-only" htmlFor={`transfer-quantity-${index}`}>
          Số lượng
        </FieldLabel>
        <Input
          id={`transfer-quantity-${index}`}
          type="number"
          min="0"
          step={selectedUnit ? 10 ** -selectedUnit.quantityPrecision : 'any'}
          inputMode="decimal"
          aria-invalid={Boolean(errors?.quantity)}
          {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
        />
        <FieldError>{errors?.quantity?.message}</FieldError>
      </Field>
      <div aria-live="polite">
        <span className="text-muted-foreground mb-0.5 block text-xs lg:hidden">
          Quy đổi về đơn vị chính
        </span>
        <span className="text-sm font-medium tabular-nums lg:inline-block lg:pt-2">
          {availability && Number.isFinite(baseQuantity) ? (
            `${formatQuantity(baseQuantity)} ${availability.baseUnitName}`
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </span>
      </div>
      <div className="flex flex-col gap-1 lg:pt-2" aria-live="polite">
        <span className="text-muted-foreground block text-xs lg:hidden">
          Tồn khả dụng ở kho xuất
        </span>
        {availability && availableInUnit !== undefined ? (
          <span className="text-sm tabular-nums">
            {formatQuantity(availableInUnit)} {selectedUnit?.unitName}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
        {exceedsAvailability ? (
          <span className="text-warning text-xs">
            Vượt tồn khả dụng hiện tại; yêu cầu sẽ bị chặn khi gửi.
          </span>
        ) : null}
        {lockInfo && lockInfo.dispatched > 0 ? (
          <span className="text-muted-foreground text-xs">
            Đã xuất {formatQuantity(lockInfo.dispatched)} {lockInfo.unitName} (không sửa được)
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hidden lg:inline-flex"
        aria-label={`Xóa dòng ${index + 1}`}
        disabled={lineCount === 1}
        onClick={() => onRemove(index)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  )
}
