'use client'

import { LoaderCircle, Save, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { WarehouseResponse } from '@/types/warehouse'
import type { LocationSearchResponse } from '@/features/warehouse/types/warehouse.types'
import type { StockPolicyFormValues } from '../schemas/product.schema'
import type { ProductWarehousePolicy } from '../types/product.types'

interface ProductStockPolicyDialogProps {
  readonly form: UseFormReturn<StockPolicyFormValues>
  readonly open: boolean
  readonly warehouses: readonly WarehouseResponse[]
  readonly policies: readonly ProductWarehousePolicy[]
  readonly locations: readonly LocationSearchResponse[]
  readonly areLocationsLoading: boolean
  readonly isPending: boolean
  readonly onWarehouseChange: (warehouseId: string) => void
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: StockPolicyFormValues) => void
}

function optionalNumber(value: string) {
  return value === '' ? null : Number(value)
}

export function ProductStockPolicyDialog({
  form,
  open,
  warehouses,
  policies,
  locations,
  areLocationsLoading,
  isPending,
  onWarehouseChange,
  onOpenChange,
  onSubmit,
}: ProductStockPolicyDialogProps) {
  const warehouseId = useWatch({ control: form.control, name: 'warehouseId' })
  const preferredSlotId = useWatch({ control: form.control, name: 'preferredSlotId' })

  function selectWarehouse(warehouseId: string) {
    const policy = policies.find((item) => item.warehouseId === warehouseId)
    form.reset({
      warehouseId,
      preferredSlotId: policy?.preferredSlotId ?? null,
      minStockThreshold: policy?.minStockThreshold ?? 0,
      maxStockThreshold: policy?.maxStockThreshold ?? null,
      reorderPoint: policy?.reorderPoint ?? null,
      safetyStock: policy?.safetyStock ?? 0,
      leadTimeDays: policy?.leadTimeDays ?? null,
    })
    onWarehouseChange(warehouseId)
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chính sách tồn kho theo kho</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              data-invalid={Boolean(form.formState.errors.warehouseId)}
            >
              <FieldLabel htmlFor="policy-warehouse">Kho</FieldLabel>
              <NativeSelect
                id="policy-warehouse"
                value={warehouseId}
                disabled={isPending}
                onChange={(event) => selectWarehouse(event.target.value)}
              >
                <NativeSelectOption value="">Chọn kho</NativeSelectOption>
                {warehouses.map((warehouse) => (
                  <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseCode} — {warehouse.warehouseName}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                errors={
                  form.formState.errors.warehouseId
                    ? [form.formState.errors.warehouseId]
                    : undefined
                }
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="policy-preferred-slot">
                Vị trí cất ưu tiên <span className="text-muted-foreground">(tùy chọn)</span>
              </FieldLabel>
              <NativeSelect
                id="policy-preferred-slot"
                value={preferredSlotId ?? ''}
                disabled={!warehouseId || areLocationsLoading || isPending}
                onChange={(event) =>
                  form.setValue('preferredSlotId', event.target.value || null, {
                    shouldDirty: true,
                  })
                }
              >
                <NativeSelectOption value="">
                  {areLocationsLoading ? 'Đang tải vị trí…' : 'Không đặt vị trí ưu tiên'}
                </NativeSelectOption>
                {locations.map((location) => (
                  <NativeSelectOption key={location.id} value={location.id}>
                    {[location.zoneCode, location.rackCode, location.code]
                      .filter(Boolean)
                      .join(' / ')}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <p className="text-muted-foreground text-xs">
                Đây là gợi ý cất hàng; hệ thống vẫn kiểm tra trạng thái và sức chứa thực tế.
              </p>
            </Field>

            <PolicyNumberField
              id="policy-minimum"
              label="Ngưỡng tối thiểu"
              error={form.formState.errors.minStockThreshold}
              inputProps={form.register('minStockThreshold', { valueAsNumber: true })}
            />
            <PolicyNumberField
              id="policy-maximum"
              label="Ngưỡng tối đa"
              optional
              error={form.formState.errors.maxStockThreshold}
              inputProps={form.register('maxStockThreshold', { setValueAs: optionalNumber })}
            />
            <PolicyNumberField
              id="policy-reorder"
              label="Điểm đặt hàng lại"
              optional
              error={form.formState.errors.reorderPoint}
              inputProps={form.register('reorderPoint', { setValueAs: optionalNumber })}
            />
            <PolicyNumberField
              id="policy-safety"
              label="Tồn kho an toàn"
              error={form.formState.errors.safetyStock}
              inputProps={form.register('safetyStock', { valueAsNumber: true })}
            />
            <PolicyNumberField
              id="policy-lead-time"
              label="Thời gian cung ứng (ngày)"
              optional
              min={1}
              error={form.formState.errors.leadTimeDays}
              inputProps={form.register('leadTimeDays', { setValueAs: optionalNumber })}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              <X data-icon="inline-start" aria-hidden="true" />
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save data-icon="inline-start" aria-hidden="true" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface PolicyNumberFieldProps {
  readonly id: string
  readonly label: string
  readonly optional?: boolean
  readonly min?: number
  readonly error?: { message?: string }
  readonly inputProps: ComponentProps<'input'>
}

function PolicyNumberField({
  id,
  label,
  optional,
  min = 0,
  error,
  inputProps,
}: PolicyNumberFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        {label}
        {optional ? <span className="text-muted-foreground"> (tùy chọn)</span> : null}
      </FieldLabel>
      <Input id={id} type="number" min={min} step="1" {...inputProps} />
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  )
}
