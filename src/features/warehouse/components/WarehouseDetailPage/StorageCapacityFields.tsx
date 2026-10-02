'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UnitResponse } from '@/features/product/types/product.types'
import type { SlotFormValues } from '../../schemas/warehouse.schema'
import { formatStorageCapacity, type CapacityLocation } from '../../utils/storage-capacity'

export interface StorageCapacityFieldsProps {
  readonly units: readonly UnitResponse[]
  readonly unitsLoading: boolean
  readonly unitsError: boolean
  readonly onRetryUnits: () => void
  readonly location?: CapacityLocation
}

export function StorageCapacityFields({
  units,
  unitsLoading,
  unitsError,
  onRetryUnits,
  location,
}: StorageCapacityFieldsProps) {
  const form = useFormContext<SlotFormValues>()
  const [capacityType, capacity, capacityUnitId] = useWatch({
    control: form.control,
    name: ['capacityType', 'capacity', 'capacityUnitId'],
  })
  const errors = form.formState.errors
  const locked = location?.capacityType === 'Quantity' && (location.currentOccupancy ?? 0) > 0
  const activeUnits = units.filter((unit) => unit.status === 'Active')
  const selectedUnit = activeUnits.find((unit) => unit.id === capacityUnitId)
  return (
    <FieldSet className="md:col-span-2">
      <FieldLegend>Chính sách sức chứa</FieldLegend>
      {location?.requiresCapacityConfiguration ? (
        <Alert>
          <AlertDescription>
            Cần cấu hình đơn vị sức chứa trước khi cất thêm hàng. Chọn theo số lượng và đơn vị phù
            hợp.
          </AlertDescription>
        </Alert>
      ) : null}
      {location ? (
        <p className="text-muted-foreground text-sm">{formatStorageCapacity(location)}</p>
      ) : null}
      {locked ? (
        <p className="text-muted-foreground text-xs">
          Vị trí đang chứa hàng: không thể đổi loại hoặc đơn vị sức chứa.
        </p>
      ) : null}
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={Boolean(errors.capacityType)} data-disabled={locked}>
          <FieldLabel htmlFor="capacity-type">Loại sức chứa</FieldLabel>
          <Select
            value={capacityType}
            disabled={locked}
            onValueChange={(value) => {
              if (value !== 'None' && value !== 'Quantity') return
              if (value === 'None') {
                form.setValue('capacity', null)
                form.setValue('capacityUnitId', null)
              }
              form.setValue('capacityType', value, { shouldDirty: true, shouldValidate: true })
            }}
          >
            <SelectTrigger
              id="capacity-type"
              className="w-full"
              aria-invalid={Boolean(errors.capacityType)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" sideOffset={4}>
              <SelectGroup>
                <SelectItem value="None">Không giới hạn</SelectItem>
                <SelectItem value="Quantity">Theo số lượng</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.capacityType]} />
        </Field>
        {capacityType === 'Quantity' ? (
          <>
            <Field data-invalid={Boolean(errors.capacity)}>
              <FieldLabel htmlFor="capacity-value">Sức chứa tối đa</FieldLabel>
              <Input
                id="capacity-value"
                name="capacity"
                autoComplete="off"
                type="number"
                inputMode="decimal"
                min="0.000001"
                step="0.000001"
                value={capacity ?? ''}
                aria-invalid={Boolean(errors.capacity)}
                onChange={(event) =>
                  form.setValue(
                    'capacity',
                    event.target.value === '' ? null : Number(event.target.value),
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
              />
              <FieldError errors={[errors.capacity]} />
            </Field>
            <Field
              data-invalid={Boolean(errors.capacityUnitId)}
              data-disabled={locked || unitsLoading || unitsError}
            >
              <FieldLabel htmlFor="capacity-unit">Đơn vị sức chứa</FieldLabel>
              <Select
                value={capacityUnitId ?? ''}
                disabled={locked || unitsLoading || unitsError}
                onValueChange={(value) =>
                  form.setValue('capacityUnitId', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="capacity-unit"
                  className="w-full"
                  aria-invalid={Boolean(errors.capacityUnitId)}
                >
                  <SelectValue
                    placeholder={unitsLoading ? 'Đang tải đơn vị…' : 'Chọn đơn vị sức chứa'}
                  >
                    {locked && !selectedUnit
                      ? (location?.capacityUnitName ?? location?.capacityUnitSymbol)
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" sideOffset={4}>
                  <SelectGroup>
                    {activeUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unitName}
                        {unit.symbol ? ` (${unit.symbol})` : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.capacityUnitId]} />
            </Field>
            {unitsError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Không thể tải đơn vị sức chứa.{' '}
                  <Button type="button" variant="link" onClick={onRetryUnits}>
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            <p className="text-muted-foreground text-xs md:col-span-2">
              Sản phẩm phải có đơn vị gốc hoặc quy đổi đang hoạt động sang đơn vị sức chứa. Hệ thống
              kiểm tra lại khi cất hàng.
            </p>
          </>
        ) : null}
      </FieldGroup>
    </FieldSet>
  )
}
