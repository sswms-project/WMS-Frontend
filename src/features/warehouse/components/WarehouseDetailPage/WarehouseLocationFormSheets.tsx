'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
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
      <SheetContent className="w-full overflow-y-auto overscroll-contain sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Thêm khu vực' : 'Chỉnh sửa khu vực'}</SheetTitle>
          <SheetDescription>
            Mã khu vực phải duy nhất trong kho và được dùng để nhận diện trong sơ đồ.
          </SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="p-4">
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
            <Field data-invalid={Boolean(errors.description)}>
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
          </FieldGroup>
          <FormFooter isPending={isPending} onCancel={() => handleOpenChange(false)} />
        </form>
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
      <SheetContent className="w-full overflow-y-auto overscroll-contain sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Thêm kệ hàng' : 'Chỉnh sửa kệ hàng'}</SheetTitle>
          <SheetDescription>Mã kệ phải duy nhất trong khu vực đang chọn.</SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="p-4">
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
            <Field>
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
                <Field orientation="horizontal">
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
                  <p className="text-muted-foreground text-xs">
                    Không áp dụng giới hạn số lượng chung khi kệ chứa nhiều sản phẩm có thể khác đơn
                    vị tính.
                  </p>
                )}
              </>
            ) : null}
          </FieldGroup>
          <FormFooter isPending={isPending} onCancel={() => handleOpenChange(false)} />
        </form>
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
      <SheetContent className="w-full overflow-y-auto overscroll-contain sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Thêm vị trí lưu trữ' : 'Chỉnh sửa vị trí'}</SheetTitle>
          <SheetDescription>
            Giới hạn số lượng không thể thấp hơn lượng hàng đang có hoặc lượng đã giữ.
          </SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="p-4">
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
            <Field orientation="horizontal">
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
              <p className="text-muted-foreground text-xs">
                Không áp dụng giới hạn số lượng chung khi vị trí chứa nhiều sản phẩm có thể khác đơn
                vị tính.
              </p>
            )}
          </FieldGroup>
          <FormFooter isPending={isPending} onCancel={() => handleOpenChange(false)} />
        </form>
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

function FormFooter({
  isPending,
  onCancel,
}: {
  readonly isPending: boolean
  readonly onCancel: () => void
}) {
  return (
    <SheetFooter>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
        ) : (
          <Save data-icon="inline-start" aria-hidden="true" />
        )}
        Lưu thay đổi
      </Button>
      <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
        Hủy
      </Button>
    </SheetFooter>
  )
}
