'use client'

import { LoaderCircle, Save, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

function optionalNumber(value: unknown) {
  return value === '' || value === null || value === undefined ? null : Number(value)
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
  const scope = useWatch({ control: form.control, name: 'scope' })

  function selectWarehouse(warehouseId: string) {
    const policy = policies.find((item) => item.warehouseId === warehouseId)
    form.reset({
      scope: 'single',
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

  function selectScope(nextScope: 'single' | 'all') {
    if (nextScope === 'single') {
      selectWarehouse(warehouseId || warehouses[0]?.id || '')
      return
    }

    form.setValue('scope', 'all', { shouldDirty: true, shouldValidate: true })
    form.setValue('warehouseId', '', { shouldDirty: true, shouldValidate: true })
    form.setValue('preferredSlotId', null, { shouldDirty: true, shouldValidate: true })
    onWarehouseChange('')
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chính sách tồn kho theo kho</DialogTitle>
          <DialogDescription>
            Thiết lập ngưỡng tồn và vị trí ưu tiên cho một hoặc nhiều kho đang quản lý.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldSet className="bg-muted/30 rounded-md border p-4 sm:col-span-2">
              <FieldLegend variant="label">Phạm vi áp dụng</FieldLegend>
              <RadioGroup
                value={scope}
                disabled={isPending}
                onValueChange={(value) => selectScope(value === 'all' ? 'all' : 'single')}
                className="mt-3 grid gap-2 sm:grid-cols-2"
              >
                <Field
                  orientation="horizontal"
                  className="bg-card hover:bg-muted/50 rounded-md border p-3 transition-colors"
                >
                  <RadioGroupItem id="policy-scope-single" value="single" />
                  <div className="grid gap-0.5">
                    <FieldLabel htmlFor="policy-scope-single">Một kho</FieldLabel>
                    <p className="text-muted-foreground text-xs">
                      Thiết lập riêng cho kho được chọn.
                    </p>
                  </div>
                </Field>
                <Field
                  orientation="horizontal"
                  className="bg-card hover:bg-muted/50 rounded-md border p-3 transition-colors"
                >
                  <RadioGroupItem id="policy-scope-all" value="all" />
                  <div className="grid gap-0.5">
                    <FieldLabel htmlFor="policy-scope-all">Tất cả kho</FieldLabel>
                    <p className="text-muted-foreground text-xs">
                      Áp dụng cùng một ngưỡng cho các kho bạn quản lý.
                    </p>
                  </div>
                </Field>
              </RadioGroup>
            </FieldSet>

            {scope === 'all' ? (
              <Alert
                variant={warehouses.length === 0 ? 'destructive' : 'default'}
                className="sm:col-span-2"
              >
                <AlertTitle>
                  {warehouses.length > 0
                    ? `Áp dụng cho ${warehouses.length} kho đang hoạt động`
                    : 'Không có kho phù hợp để áp dụng'}
                </AlertTitle>
                <AlertDescription>
                  {warehouses.length > 0
                    ? 'Chỉ các kho bạn đang được quản lý tại thời điểm lưu được cập nhật. Kho tạo hoặc phân công sau này không tự động nhận chính sách này.'
                    : 'Bạn cần được phân công quản lý ít nhất một kho đang hoạt động.'}
                </AlertDescription>
              </Alert>
            ) : null}

            {scope === 'single' ? (
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
            ) : null}

            {scope === 'single' ? (
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
            ) : null}

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
            <Button
              type="submit"
              disabled={
                isPending || !form.formState.isDirty || (scope === 'all' && warehouses.length === 0)
              }
            >
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
