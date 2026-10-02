'use client'

import { useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import type { CapacityLocation } from '../../utils/storage-capacity'
import { StorageCapacitySummary } from './StorageCapacitySummary'

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
  const [confirmUnlimited, setConfirmUnlimited] = useState(false)
  const typeTriggerRef = useRef<HTMLButtonElement>(null)
  const [capacityType, capacity, capacityUnitId] = useWatch({
    control: form.control,
    name: ['capacityType', 'capacity', 'capacityUnitId'],
  })
  const errors = form.formState.errors
  const locked = location?.capacityType === 'Quantity' && (location.currentOccupancy ?? 0) > 0
  const activeUnits = units.filter((unit) => unit.status === 'Active')
  const selectedUnit = activeUnits.find((unit) => unit.id === capacityUnitId)
  const unitLabel = selectedUnit
    ? `${selectedUnit.unitName}${selectedUnit.symbol ? ` (${selectedUnit.symbol})` : ''}`
    : locked
      ? (location?.capacityUnitName ?? location?.capacityUnitSymbol)
      : undefined

  function applyUnlimited() {
    form.setValue('capacity', null, { shouldDirty: true })
    form.setValue('capacityUnitId', null, { shouldDirty: true })
    form.setValue('capacityType', 'None', { shouldDirty: true, shouldValidate: true })
    form.clearErrors(['capacity', 'capacityUnitId'])
  }
  return (
    <FieldSet className="min-w-0">
      <FieldLegend variant="label">Chính sách sức chứa</FieldLegend>
      <div className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
        <Info className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          {capacityType === 'Quantity' ? (
            <>
              Giới hạn tổng lượng hàng sau quy đổi về đơn vị sức chứa.
              <br />
              VD: Sức chứa 20 thùng, đang có 8 thùng → còn nhận tối đa 12 thùng.
            </>
          ) : (
            <>
              Không giới hạn: hệ thống không kiểm tra sức chứa tối đa khi cất hàng.
              <br />
              VD: Không chặn theo số lượng; quy tắc một hay nhiều sản phẩm vẫn áp dụng.
            </>
          )}
        </p>
      </div>
      {location && !location.requiresCapacityConfiguration ? (
        <StorageCapacitySummary location={location} />
      ) : null}
      {locked ? (
        <p className="text-muted-foreground text-xs">
          Vị trí đang chứa hàng: không thể đổi loại hoặc đơn vị sức chứa.
        </p>
      ) : null}
      <div className="min-w-0 overflow-hidden rounded-md border">
        <Table aria-label="Chính sách sức chứa" className="min-w-[34rem] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Loại sức chứa</TableHead>
              <TableHead scope="col">Sức chứa tối đa</TableHead>
              <TableHead scope="col">Đơn vị sức chứa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell className="align-top whitespace-normal">
                <Field data-invalid={Boolean(errors.capacityType)} data-disabled={locked}>
                  <FieldLabel className="sr-only" htmlFor="capacity-type">
                    Loại sức chứa
                  </FieldLabel>
                  <Select
                    value={capacityType}
                    disabled={locked}
                    onValueChange={(value) => {
                      if (value !== 'None' && value !== 'Quantity') return
                      if (value === 'None') {
                        if (capacityType === 'Quantity' && (capacity != null || capacityUnitId)) {
                          setConfirmUnlimited(true)
                          return
                        }
                        applyUnlimited()
                        return
                      }
                      form.setValue('capacityType', value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                  >
                    <SelectTrigger
                      id="capacity-type"
                      ref={typeTriggerRef}
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
              </TableCell>
              {capacityType === 'Quantity' ? (
                <>
                  <TableCell className="align-top whitespace-normal">
                    <Field data-invalid={Boolean(errors.capacity)} className="min-w-0">
                      <FieldLabel className="sr-only" htmlFor="capacity-value">
                        Sức chứa tối đa
                      </FieldLabel>
                      <Input
                        id="capacity-value"
                        {...form.register('capacity', {
                          setValueAs: (value: string | number | null) =>
                            value === '' || value === null ? null : Number(value),
                        })}
                        autoComplete="off"
                        type="number"
                        inputMode="decimal"
                        min="0.000001"
                        step="0.000001"
                        value={capacity ?? ''}
                        aria-invalid={Boolean(errors.capacity)}
                        aria-describedby={errors.capacity ? 'capacity-value-error' : undefined}
                        onChange={(event) =>
                          form.setValue(
                            'capacity',
                            event.target.value === '' ? null : Number(event.target.value),
                            { shouldDirty: true, shouldValidate: true }
                          )
                        }
                      />
                      <FieldError id="capacity-value-error" errors={[errors.capacity]} />
                    </Field>
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">
                    <Field
                      data-invalid={Boolean(errors.capacityUnitId)}
                      data-disabled={locked || unitsLoading || unitsError}
                    >
                      <FieldLabel className="sr-only" htmlFor="capacity-unit">
                        Đơn vị sức chứa
                      </FieldLabel>
                      <Controller
                        control={form.control}
                        name="capacityUnitId"
                        render={({ field }) => (
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
                              ref={field.ref}
                              onBlur={field.onBlur}
                              className="w-full min-w-0"
                              title={unitLabel ?? undefined}
                              aria-invalid={Boolean(errors.capacityUnitId)}
                              aria-describedby={
                                errors.capacityUnitId ? 'capacity-unit-error' : undefined
                              }
                            >
                              <SelectValue
                                placeholder={
                                  unitsLoading ? 'Đang tải đơn vị…' : 'Chọn đơn vị sức chứa'
                                }
                              >
                                {unitLabel ? (
                                  <span className="block min-w-0 truncate">{unitLabel}</span>
                                ) : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent align="start" sideOffset={4}>
                              <SelectGroup>
                                {activeUnits.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    <span className="block max-w-64 truncate" title={unit.unitName}>
                                      {unit.unitName}
                                      {unit.symbol ? ` (${unit.symbol})` : ''}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError id="capacity-unit-error" errors={[errors.capacityUnitId]} />
                    </Field>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell
                    className="text-muted-foreground"
                    aria-label="Không áp dụng sức chứa tối đa"
                  >
                    —
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground"
                    aria-label="Không áp dụng đơn vị sức chứa"
                  >
                    —
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {capacityType === 'Quantity' ? (
        <>
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
          <p className="text-muted-foreground text-xs">
            Sản phẩm phải có đơn vị gốc hoặc quy đổi đang hoạt động sang đơn vị sức chứa. Hệ thống
            kiểm tra lại khi cất hàng.
          </p>
        </>
      ) : null}
      <AlertDialog open={confirmUnlimited} onOpenChange={setConfirmUnlimited}>
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            typeTriggerRef.current?.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Chuyển sang không giới hạn sức chứa?</AlertDialogTitle>
            <AlertDialogDescription>
              Sức chứa tối đa và đơn vị sức chứa đang nhập sẽ được bỏ khỏi form. Thay đổi chỉ được
              áp dụng khi bạn lưu vị trí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ cấu hình</AlertDialogCancel>
            <AlertDialogAction onClick={applyUnlimited}>
              Chuyển sang không giới hạn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FieldSet>
  )
}
