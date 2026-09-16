'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { stockPolicySchema, type StockPolicyFormValues } from '../schemas/product.schema'
import type { ProductWarehousePolicy } from '../types/product.types'

interface ProductStockPolicyDialogProps {
  readonly open: boolean
  readonly warehouses: readonly WarehouseResponse[]
  readonly policies: readonly ProductWarehousePolicy[]
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: StockPolicyFormValues) => void
}

function optionalNumber(value: string) {
  return value === '' ? null : Number(value)
}

export function ProductStockPolicyDialog({
  open,
  warehouses,
  policies,
  isPending,
  onOpenChange,
  onSubmit,
}: ProductStockPolicyDialogProps) {
  const initialWarehouseId = policies[0]?.warehouseId ?? warehouses[0]?.id ?? ''
  const initialPolicy = policies.find((policy) => policy.warehouseId === initialWarehouseId)
  const form = useForm<StockPolicyFormValues>({
    resolver: zodResolver(stockPolicySchema),
    defaultValues: {
      warehouseId: initialWarehouseId,
      minStockThreshold: initialPolicy?.minStockThreshold ?? 0,
      maxStockThreshold: initialPolicy?.maxStockThreshold ?? null,
      reorderPoint: initialPolicy?.reorderPoint ?? null,
      safetyStock: initialPolicy?.safetyStock ?? 0,
      leadTimeDays: initialPolicy?.leadTimeDays ?? null,
    },
  })
  const warehouseId = useWatch({ control: form.control, name: 'warehouseId' })

  function selectWarehouse(warehouseId: string) {
    const policy = policies.find((item) => item.warehouseId === warehouseId)
    form.reset({
      warehouseId,
      minStockThreshold: policy?.minStockThreshold ?? 0,
      maxStockThreshold: policy?.maxStockThreshold ?? null,
      reorderPoint: policy?.reorderPoint ?? null,
      safetyStock: policy?.safetyStock ?? 0,
      leadTimeDays: policy?.leadTimeDays ?? null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-w-lg">
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
