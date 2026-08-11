'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
            Sức chứa không thể giảm thấp hơn lượng hàng hoặc lượng đã giữ chỗ.
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
            <Field data-invalid={Boolean(errors.capacity)}>
              <FieldLabel htmlFor="slot-capacity">Sức chứa</FieldLabel>
              <Input
                id="slot-capacity"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={Boolean(errors.capacity)}
                {...form.register('capacity', { valueAsNumber: true })}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>
          </FieldGroup>
          <FormFooter isPending={isPending} onCancel={() => handleOpenChange(false)} />
        </form>
      </SheetContent>
    </Sheet>
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
