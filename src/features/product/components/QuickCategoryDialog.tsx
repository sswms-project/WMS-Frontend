'use client'

import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { CategoryFormValues } from '../schemas/master-data.schema'
import type { CategoryResponse } from '../types/product.types'

interface QuickCategoryDialogProps {
  readonly form: UseFormReturn<CategoryFormValues>
  readonly open: boolean
  readonly categories: readonly CategoryResponse[]
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CategoryFormValues) => Promise<void>
}

export function QuickCategoryDialog({
  form,
  open,
  categories,
  isPending,
  onOpenChange,
  onSubmit,
}: QuickCategoryDialogProps) {
  const parentCategoryId = useWatch({ control: form.control, name: 'parentCategoryId' })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo nhanh nhóm vật tư hàng hóa</DialogTitle>
          <DialogDescription>
            Nhóm mới sẽ được chọn tự động cho sản phẩm đang nhập.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.categoryCode)}>
              <FieldLabel htmlFor="quickCategoryCode">Mã nhóm *</FieldLabel>
              <Input id="quickCategoryCode" autoComplete="off" {...form.register('categoryCode')} />
              <FieldError
                errors={
                  form.formState.errors.categoryCode
                    ? [form.formState.errors.categoryCode]
                    : undefined
                }
              />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.categoryName)}>
              <FieldLabel htmlFor="quickCategoryName">Tên nhóm *</FieldLabel>
              <Input id="quickCategoryName" autoComplete="off" {...form.register('categoryName')} />
              <FieldError
                errors={
                  form.formState.errors.categoryName
                    ? [form.formState.errors.categoryName]
                    : undefined
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="quickParentCategoryId">Nhóm cha</FieldLabel>
              <NativeSelect
                id="quickParentCategoryId"
                value={parentCategoryId ?? ''}
                onChange={(event) =>
                  form.setValue('parentCategoryId', event.target.value || null, {
                    shouldDirty: true,
                  })
                }
              >
                <NativeSelectOption value="">Không có — nhóm cấp cao</NativeSelectOption>
                {categories
                  .filter((category) => category.status === 'Active' && category.level < 5)
                  .map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {category.categoryPath}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="quickCategoryDescription">Mô tả</FieldLabel>
              <Textarea id="quickCategoryDescription" rows={3} {...form.register('description')} />
              <FieldError
                errors={
                  form.formState.errors.description
                    ? [form.formState.errors.description]
                    : undefined
                }
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Tạo và chọn nhóm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
