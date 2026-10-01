'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save } from 'lucide-react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import type {
  StorageLengthUnit,
  StorageMassUnit,
  WarehousePhysicalDetails,
} from '../../types/warehouse.types'
import {
  rackSchema,
  slotSchema,
  zoneSchema,
  type RackFormValues,
  type SlotFormValues,
  type ZoneFormValues,
} from '../../schemas/warehouse.schema'

interface LocationFormSheetProps<TValues> {
  readonly open: boolean
  readonly mode: 'create' | 'update'
  readonly isPending: boolean
  readonly defaultValues: TValues
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: TValues) => Promise<boolean>
}

const LOCATION_FORM_SHEET_CLASS =
  'w-full max-w-full overflow-hidden overscroll-contain data-[side=right]:w-full data-[side=right]:sm:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-4/5 data-[side=right]:lg:w-2/3 data-[side=right]:xl:w-1/2'

const LOCATION_FORM_HEADER_CLASS = 'shrink-0 border-b px-5 py-4 pr-12'
const LOCATION_FORM_BODY_CLASS =
  'grid min-h-0 flex-1 content-start grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-5 py-5 md:grid-cols-2'

export function ZoneFormSheet({
  open,
  mode,
  isPending,
  defaultValues,
  onOpenChange,
  onSubmit,
}: LocationFormSheetProps<ZoneFormValues>) {
  const form = useForm<ZoneFormValues>({ resolver: zodResolver(zoneSchema), defaultValues })
  const { errors } = form.formState

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isPending) form.reset(defaultValues)
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: ZoneFormValues) {
    if (await onSubmit(values)) form.reset(defaultValues)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className={LOCATION_FORM_SHEET_CLASS}>
        <SheetHeader className={LOCATION_FORM_HEADER_CLASS}>
          <SheetTitle className="text-base font-semibold">
            {mode === 'create' ? 'Thêm khu vực' : 'Chỉnh sửa khu vực'}
          </SheetTitle>
          <SheetDescription>
            Mã khu vực phải duy nhất trong kho và được dùng để nhận diện trong sơ đồ.
          </SheetDescription>
        </SheetHeader>
        <FormProvider {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FieldGroup className={LOCATION_FORM_BODY_CLASS}>
              <Field data-invalid={Boolean(errors.zoneCode)}>
                <FieldLabel htmlFor="zone-code">Mã khu vực</FieldLabel>
                <Input
                  id="zone-code"
                  translate="no"
                  className="font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.zoneCode)}
                  {...form.register('zoneCode')}
                />
                <FieldError errors={[errors.zoneCode]} />
              </Field>
              <Field data-invalid={Boolean(errors.zoneName)}>
                <FieldLabel htmlFor="zone-name">Tên khu vực</FieldLabel>
                <Input
                  id="zone-name"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.zoneName)}
                  {...form.register('zoneName')}
                />
                <FieldError errors={[errors.zoneName]} />
              </Field>
              <Field data-invalid={Boolean(errors.description)} className="md:col-span-2">
                <FieldLabel htmlFor="zone-description">Mô tả</FieldLabel>
                <Textarea
                  id="zone-description"
                  autoComplete="off"
                  rows={4}
                  aria-invalid={Boolean(errors.description)}
                  {...form.register('description')}
                />
                <FieldError errors={[errors.description]} />
              </Field>
              <PhysicalDetailsFields />
            </FieldGroup>
            <FormFooter
              mode={mode}
              isPending={isPending}
              onCancel={() => handleOpenChange(false)}
            />
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  )
}

export function RackFormSheet({
  open,
  mode,
  isPending,
  defaultValues,
  onOpenChange,
  onSubmit,
}: LocationFormSheetProps<RackFormValues>) {
  const form = useForm<RackFormValues>({ resolver: zodResolver(rackSchema), defaultValues })
  const { errors } = form.formState
  const storageMode = useWatch({ control: form.control, name: 'storageMode' })
  const allowsMixedProducts = useWatch({ control: form.control, name: 'allowsMixedProducts' })
  const capacity = useWatch({ control: form.control, name: 'capacity' })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isPending) form.reset(defaultValues)
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: RackFormValues) {
    if (await onSubmit(values)) form.reset(defaultValues)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className={LOCATION_FORM_SHEET_CLASS}>
        <SheetHeader className={LOCATION_FORM_HEADER_CLASS}>
          <SheetTitle className="text-base font-semibold">
            {mode === 'create' ? 'Thêm kệ hàng' : 'Chỉnh sửa kệ hàng'}
          </SheetTitle>
          <SheetDescription>Mã kệ phải duy nhất trong khu vực đang chọn.</SheetDescription>
        </SheetHeader>
        <FormProvider {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FieldGroup className={LOCATION_FORM_BODY_CLASS}>
              <Field data-invalid={Boolean(errors.rackCode)}>
                <FieldLabel htmlFor="rack-code">Mã kệ</FieldLabel>
                <Input
                  id="rack-code"
                  translate="no"
                  className="font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.rackCode)}
                  {...form.register('rackCode')}
                />
                <FieldError errors={[errors.rackCode]} />
              </Field>
              <Field data-invalid={Boolean(errors.rackName)}>
                <FieldLabel htmlFor="rack-name">Tên kệ</FieldLabel>
                <Input
                  id="rack-name"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.rackName)}
                  {...form.register('rackName')}
                />
                <FieldError errors={[errors.rackName]} />
              </Field>
              <Field data-invalid={Boolean(errors.description)} className="md:col-span-2">
                <FieldLabel htmlFor="rack-description">Mô tả</FieldLabel>
                <Textarea
                  id="rack-description"
                  rows={3}
                  aria-invalid={Boolean(errors.description)}
                  {...form.register('description')}
                />
                <FieldError errors={[errors.description]} />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel>Phương thức quản lý vị trí</FieldLabel>
                <RadioGroup
                  aria-label="Phương thức quản lý vị trí"
                  value={storageMode}
                  onValueChange={(value) => {
                    if (value !== 'RackLevel' && value !== 'SlotLevel') return
                    form.setValue('storageMode', value, { shouldDirty: true, shouldValidate: true })
                    if (value === 'SlotLevel') {
                      form.setValue('allowsMixedProducts', true)
                      form.setValue('capacity', null)
                    }
                  }}
                  className="gap-2"
                >
                  <Label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                    <RadioGroupItem value="RackLevel" />
                    <span>
                      <span className="block text-sm font-medium">Quản lý theo kệ</span>
                      <span className="text-muted-foreground mt-1 block text-xs font-normal">
                        Hàng được ghi nhận trực tiếp tại kệ, không cần tạo vị trí nhỏ hơn.
                      </span>
                    </span>
                  </Label>
                  <Label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                    <RadioGroupItem value="SlotLevel" />
                    <span>
                      <span className="block text-sm font-medium">Quản lý theo vị trí lưu trữ</span>
                      <span className="text-muted-foreground mt-1 block text-xs font-normal">
                        Người dùng tạo các vị trí lưu trữ riêng bên trong kệ.
                      </span>
                    </span>
                  </Label>
                </RadioGroup>
              </Field>
              {storageMode === 'RackLevel' ? (
                <>
                  <Field orientation="horizontal" className="md:col-span-2">
                    <Checkbox
                      id="rack-allows-mixed-products"
                      checked={allowsMixedProducts}
                      onCheckedChange={(checked) => {
                        form.setValue('allowsMixedProducts', checked === true, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                        if (checked === true) form.setValue('capacity', null)
                      }}
                    />
                    <FieldLabel htmlFor="rack-allows-mixed-products">
                      Cho phép nhiều sản phẩm trong cùng kệ
                    </FieldLabel>
                  </Field>
                  {!allowsMixedProducts ? (
                    <CapacityField
                      id="rack-capacity"
                      value={capacity}
                      errorMessage={errors.capacity?.message}
                      onChange={(capacity) =>
                        form.setValue('capacity', capacity, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground text-xs md:col-span-2">
                      Không áp dụng giới hạn số lượng chung khi kệ chứa nhiều sản phẩm có thể khác
                      đơn vị tính.
                    </p>
                  )}
                </>
              ) : null}
              <PhysicalDetailsFields />
            </FieldGroup>
            <FormFooter
              mode={mode}
              isPending={isPending}
              onCancel={() => handleOpenChange(false)}
            />
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  )
}

export function SlotFormSheet({
  open,
  mode,
  isPending,
  defaultValues,
  onOpenChange,
  onSubmit,
}: LocationFormSheetProps<SlotFormValues>) {
  const form = useForm<SlotFormValues>({ resolver: zodResolver(slotSchema), defaultValues })
  const { errors } = form.formState
  const allowsMixedProducts = useWatch({ control: form.control, name: 'allowsMixedProducts' })
  const capacity = useWatch({ control: form.control, name: 'capacity' })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isPending) form.reset(defaultValues)
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: SlotFormValues) {
    if (await onSubmit(values)) form.reset(defaultValues)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className={LOCATION_FORM_SHEET_CLASS}>
        <SheetHeader className={LOCATION_FORM_HEADER_CLASS}>
          <SheetTitle className="text-base font-semibold">
            {mode === 'create' ? 'Thêm vị trí lưu trữ' : 'Chỉnh sửa vị trí'}
          </SheetTitle>
          <SheetDescription>
            Giới hạn số lượng không thể thấp hơn lượng hàng đang có hoặc lượng đã giữ.
          </SheetDescription>
        </SheetHeader>
        <FormProvider {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FieldGroup className={LOCATION_FORM_BODY_CLASS}>
              <Field data-invalid={Boolean(errors.slotCode)}>
                <FieldLabel htmlFor="slot-code">Mã vị trí</FieldLabel>
                <Input
                  id="slot-code"
                  translate="no"
                  className="font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.slotCode)}
                  {...form.register('slotCode')}
                />
                <FieldError errors={[errors.slotCode]} />
              </Field>
              <Field data-invalid={Boolean(errors.slotName)}>
                <FieldLabel htmlFor="slot-name">Tên vị trí</FieldLabel>
                <Input
                  id="slot-name"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.slotName)}
                  {...form.register('slotName')}
                />
                <FieldError errors={[errors.slotName]} />
              </Field>
              <Field data-invalid={Boolean(errors.description)} className="md:col-span-2">
                <FieldLabel htmlFor="slot-description">Mô tả</FieldLabel>
                <Textarea
                  id="slot-description"
                  rows={3}
                  aria-invalid={Boolean(errors.description)}
                  {...form.register('description')}
                />
                <FieldError errors={[errors.description]} />
              </Field>
              <Field orientation="horizontal" className="md:col-span-2">
                <Checkbox
                  id="slot-allows-mixed-products"
                  checked={allowsMixedProducts}
                  onCheckedChange={(checked) => {
                    form.setValue('allowsMixedProducts', checked === true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    if (checked === true) form.setValue('capacity', null)
                  }}
                />
                <FieldLabel htmlFor="slot-allows-mixed-products">
                  Cho phép nhiều sản phẩm trong cùng vị trí
                </FieldLabel>
              </Field>
              {!allowsMixedProducts ? (
                <CapacityField
                  id="slot-capacity"
                  value={capacity}
                  errorMessage={errors.capacity?.message}
                  onChange={(capacity) =>
                    form.setValue('capacity', capacity, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              ) : (
                <p className="text-muted-foreground text-xs md:col-span-2">
                  Không áp dụng giới hạn số lượng chung khi vị trí chứa nhiều sản phẩm có thể khác
                  đơn vị tính.
                </p>
              )}
              <PhysicalDetailsFields />
            </FieldGroup>
            <FormFooter
              mode={mode}
              isPending={isPending}
              onCancel={() => handleOpenChange(false)}
            />
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  )
}

function CapacityField({
  id,
  value,
  errorMessage,
  onChange,
}: {
  readonly id: string
  readonly value: number | null
  readonly errorMessage?: string
  readonly onChange: (value: number | null) => void
}) {
  return (
    <Field data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor={id}>Giới hạn số lượng (không bắt buộc)</FieldLabel>
      <Input
        id={id}
        name={id}
        type="number"
        min="0.01"
        step="0.01"
        inputMode="decimal"
        autoComplete="off"
        value={value ?? ''}
        aria-invalid={Boolean(errorMessage)}
        onChange={(event) =>
          onChange(event.currentTarget.value === '' ? null : Number(event.currentTarget.value))
        }
      />
      {errorMessage ? <p className="text-destructive text-xs">{errorMessage}</p> : null}
    </Field>
  )
}

const MASS_UNITS: ReadonlyArray<{ value: StorageMassUnit; label: string }> = [
  { value: 'Ton', label: 'tấn' },
  { value: 'Kilogram', label: 'kg' },
  { value: 'Gram', label: 'gam' },
]

const LENGTH_UNITS: ReadonlyArray<{ value: StorageLengthUnit; label: string }> = [
  { value: 'Kilometer', label: 'km' },
  { value: 'Meter', label: 'm' },
  { value: 'Decimeter', label: 'dm' },
  { value: 'Centimeter', label: 'cm' },
]

function PhysicalDetailsFields() {
  const form = useFormContext<WarehousePhysicalDetails>()
  const values = useWatch({ control: form.control })
  const errors = form.formState.errors

  return (
    <section className="space-y-3 pt-2 md:col-span-2" aria-labelledby="physical-details-heading">
      <h3 id="physical-details-heading" className="text-base font-semibold">
        Thông tin chi tiết
      </h3>
      <div className="overflow-x-auto rounded-md border">
        <div className="bg-muted/70 grid min-w-[38rem] grid-cols-[minmax(9rem,1.4fr)_5rem_minmax(8rem,1fr)_minmax(7rem,0.8fr)] border-b px-3 py-2 text-sm font-medium">
          <span>Thông tin</span>
          <span>Điều kiện</span>
          <span>Giá trị</span>
          <span>Đơn vị tính</span>
        </div>
        <PhysicalDetailRow
          label="Dung lượng lưu trữ"
          value={values.storageCapacity ?? null}
          unit={values.storageCapacityUnit ?? null}
          units={MASS_UNITS}
          valueError={errors.storageCapacity?.message}
          unitError={errors.storageCapacityUnit?.message}
          onValueChange={(value) => {
            form.setValue('storageCapacity', value, { shouldDirty: true, shouldValidate: true })
            form.setValue(
              'storageCapacityUnit',
              value === null ? null : (values.storageCapacityUnit ?? 'Kilogram'),
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            )
          }}
          onUnitChange={(unit) =>
            form.setValue('storageCapacityUnit', unit, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <PhysicalDetailRow
          label="Chiều dài"
          value={values.physicalLength ?? null}
          unit={values.physicalLengthUnit ?? null}
          units={LENGTH_UNITS}
          valueError={errors.physicalLength?.message}
          unitError={errors.physicalLengthUnit?.message}
          onValueChange={(value) => {
            form.setValue('physicalLength', value, { shouldDirty: true, shouldValidate: true })
            form.setValue(
              'physicalLengthUnit',
              value === null ? null : (values.physicalLengthUnit ?? 'Meter'),
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            )
          }}
          onUnitChange={(unit) =>
            form.setValue('physicalLengthUnit', unit, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <PhysicalDetailRow
          label="Chiều rộng"
          value={values.physicalWidth ?? null}
          unit={values.physicalWidthUnit ?? null}
          units={LENGTH_UNITS}
          valueError={errors.physicalWidth?.message}
          unitError={errors.physicalWidthUnit?.message}
          onValueChange={(value) => {
            form.setValue('physicalWidth', value, { shouldDirty: true, shouldValidate: true })
            form.setValue(
              'physicalWidthUnit',
              value === null ? null : (values.physicalWidthUnit ?? 'Meter'),
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            )
          }}
          onUnitChange={(unit) =>
            form.setValue('physicalWidthUnit', unit, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <PhysicalDetailRow
          label="Chiều cao"
          value={values.physicalHeight ?? null}
          unit={values.physicalHeightUnit ?? null}
          units={LENGTH_UNITS}
          valueError={errors.physicalHeight?.message}
          unitError={errors.physicalHeightUnit?.message}
          onValueChange={(value) => {
            form.setValue('physicalHeight', value, { shouldDirty: true, shouldValidate: true })
            form.setValue(
              'physicalHeightUnit',
              value === null ? null : (values.physicalHeightUnit ?? 'Meter'),
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            )
          }}
          onUnitChange={(unit) =>
            form.setValue('physicalHeightUnit', unit, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </div>
    </section>
  )
}

function PhysicalDetailRow<TUnit extends string>({
  label,
  value,
  unit,
  units,
  valueError,
  unitError,
  onValueChange,
  onUnitChange,
}: {
  readonly label: string
  readonly value: number | null
  readonly unit: TUnit | null
  readonly units: ReadonlyArray<{ value: TUnit; label: string }>
  readonly valueError?: string
  readonly unitError?: string
  readonly onValueChange: (value: number | null) => void
  readonly onUnitChange: (unit: TUnit) => void
}) {
  const id = `physical-${label.toLocaleLowerCase('vi').replaceAll(' ', '-')}`
  return (
    <div className="grid min-w-[38rem] grid-cols-[minmax(9rem,1.4fr)_5rem_minmax(8rem,1fr)_minmax(7rem,0.8fr)] items-start gap-x-3 border-b px-3 py-2 last:border-b-0">
      <Label htmlFor={id} className="pt-2 font-normal">
        {label}
      </Label>
      <span className="pt-2 text-sm">=</span>
      <div>
        <Input
          id={id}
          type="number"
          min="0.001"
          step="0.001"
          inputMode="decimal"
          value={value ?? ''}
          aria-invalid={Boolean(valueError)}
          onChange={(event) =>
            onValueChange(
              event.currentTarget.value === '' ? null : Number(event.currentTarget.value)
            )
          }
        />
        {valueError ? <p className="text-destructive mt-1 text-xs">{valueError}</p> : null}
      </div>
      <div>
        <Select
          value={unit ?? undefined}
          onValueChange={(value) => {
            const selectedUnit = units.find((option) => option.value === value)
            if (selectedUnit) onUnitChange(selectedUnit.value)
          }}
        >
          <SelectTrigger className="w-full" aria-invalid={Boolean(unitError)}>
            <SelectValue placeholder="Chọn đơn vị" />
          </SelectTrigger>
          <SelectContent>
            {units.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {unitError ? <p className="text-destructive mt-1 text-xs">{unitError}</p> : null}
      </div>
    </div>
  )
}

function FormFooter({
  mode,
  isPending,
  onCancel,
}: {
  readonly mode: 'create' | 'update'
  readonly isPending: boolean
  readonly onCancel: () => void
}) {
  return (
    <SheetFooter className="bg-popover shrink-0 border-t px-5 py-4 sm:flex-row sm:justify-end">
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
        ) : (
          <Save data-icon="inline-start" aria-hidden="true" />
        )}
        {mode === 'create' ? 'Lưu' : 'Lưu thay đổi'}
      </Button>
      <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
        Hủy
      </Button>
    </SheetFooter>
  )
}
