import { Trash2 } from 'lucide-react'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type {
  ProductResponse,
  ProductUnitConversion,
  UnitResponse,
} from '@/features/product/types/product.types'
import {
  resolveInboundLineUnits,
  type InboundRequestFormValues,
} from '../../schemas/inbound-request.schema'
import type { LookupOption } from '../../types/inbound-request.types'
import { formatQuantity } from '../../utils/inbound-request-format'
import { ProductSelect } from './ProductSelect'

interface InboundRequestLineRowProps {
  readonly field: FieldArrayWithId<InboundRequestFormValues, 'lines', 'id'>
  readonly index: number
  readonly lineCount: number
  readonly form: UseFormReturn<InboundRequestFormValues>
  readonly product?: ProductResponse
  readonly options: readonly LookupOption[]
  readonly conversions: readonly ProductUnitConversion[]
  readonly units: readonly UnitResponse[]
  readonly isProductSearchLoading: boolean
  readonly isUnitLoading: boolean
  readonly onProductSearchChange: (scope: string, value: string) => void
  readonly onRemove: (index: number) => void
}

export function InboundRequestLineRow({
  field,
  index,
  lineCount,
  form,
  product,
  options,
  conversions,
  units,
  isProductSearchLoading,
  isUnitLoading,
  onProductSearchChange,
  onRemove,
}: InboundRequestLineRowProps) {
  const line = form.watch(`lines.${index}`)
  const { alternatives, baseUnit, selectedUnit, factor } = resolveInboundLineUnits(
    product,
    line.unitId,
    units,
    conversions
  )
  const baseQuantity = line.quantity * (factor ?? 0)
  const errors = form.formState.errors.lines?.[index]

  return (
    <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] lg:items-start">
      <div>
        <div className="mb-1 flex items-center justify-between lg:hidden">
          <span className="text-muted-foreground text-xs font-medium">Dòng {index + 1}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Xóa dòng ${index + 1}`}
            disabled={lineCount === 1}
            onClick={() => onRemove(index)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
        <FieldLabel className="mb-2 block text-xs" htmlFor={`product-${index}`}>
          Sản phẩm
        </FieldLabel>
        <ProductSelect
          inputId={`product-${index}`}
          searchScope={field.id}
          index={index}
          form={form}
          options={options}
          isLoading={isProductSearchLoading}
          selectedOption={
            product
              ? { value: product.id, label: `${product.sku} - ${product.productName}` }
              : undefined
          }
          onSearchChange={onProductSearchChange}
        />
      </div>
      <Field data-invalid={Boolean(errors?.unitId)}>
        <FieldLabel htmlFor={`unit-${index}`}>Đơn vị tính</FieldLabel>
        <NativeSelect
          id={`unit-${index}`}
          className="w-full"
          disabled={!product || isUnitLoading}
          aria-invalid={Boolean(errors?.unitId)}
          value={line.unitId}
          onChange={(event) =>
            form.setValue(`lines.${index}.unitId`, event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <NativeSelectOption value={product?.unitId ?? ''}>
            {baseUnit?.unitName ?? 'Đơn vị cơ sở'}
          </NativeSelectOption>
          {alternatives.map((conversion) => (
            <NativeSelectOption key={conversion.unitId} value={conversion.unitId}>
              {conversion.unitName} (×{formatQuantity(conversion.conversionFactor)})
            </NativeSelectOption>
          ))}
          {line.unitId &&
          line.unitId !== product?.unitId &&
          !alternatives.some((conversion) => conversion.unitId === line.unitId) ? (
            <NativeSelectOption value={line.unitId} disabled>
              Đơn vị đã ngừng sử dụng
            </NativeSelectOption>
          ) : null}
        </NativeSelect>
        <FieldError>{errors?.unitId?.message}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.quantity)}>
        <FieldLabel htmlFor={`quantity-${index}`}>Số lượng</FieldLabel>
        <Input
          id={`quantity-${index}`}
          type="number"
          min="0"
          step={selectedUnit ? 10 ** -selectedUnit.quantityPrecision : 'any'}
          aria-invalid={Boolean(errors?.quantity)}
          {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
        />
        <FieldError>{errors?.quantity?.message}</FieldError>
      </Field>
      <div className="bg-muted/60 border px-3 py-2 text-sm" aria-live="polite">
        <span className="text-muted-foreground block text-xs">Quy đổi về đơn vị cơ sở</span>
        <span className="font-medium tabular-nums">
          {product && factor !== undefined && Number.isFinite(baseQuantity)
            ? `${formatQuantity(baseQuantity)} ${baseUnit?.unitName ?? ''}`
            : 'Chọn sản phẩm và đơn vị'}
        </span>
        {product &&
        factor !== undefined &&
        baseUnit &&
        Math.abs(baseQuantity - Number(baseQuantity.toFixed(2))) > 1e-9 ? (
          <span className="text-warning mt-1 block text-xs">
            Phiếu nhận hàng hiện chỉ hỗ trợ 2 chữ số thập phân.
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="mt-7 hidden lg:inline-flex"
        aria-label={`Xóa dòng ${index + 1}`}
        disabled={lineCount === 1}
        onClick={() => onRemove(index)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  )
}
