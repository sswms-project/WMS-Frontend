'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { createProductSchema, updateProductSchema } from '../schemas/product.schema'
import type { CreateProductFormValues, UpdateProductFormValues } from '../schemas/product.schema'
import type { CategoryResponse, ProductResponse, UnitResponse } from '../types/product.types'

interface ProductReferenceOptionsProps {
  readonly units: readonly UnitResponse[]
  readonly categories: readonly CategoryResponse[]
  readonly areOptionsLoading: boolean
  readonly areOptionsError: boolean
  readonly onRetryOptions: () => void
}

interface CreateProductFormProps extends ProductReferenceOptionsProps {
  readonly isPending: boolean
  readonly onSubmit: (values: CreateProductFormValues) => void
  readonly onCancel: () => void
}

export function CreateProductForm({
  units,
  categories,
  areOptionsLoading,
  areOptionsError,
  onRetryOptions,
  isPending,
  onSubmit,
  onCancel,
}: CreateProductFormProps) {
  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: '',
      productName: '',
      unitId: '',
      categoryId: '',
      isLotTracked: false,
      shelfLifeDays: null,
    },
  })
  const isLotTracked = useWatch({ control: form.control, name: 'isLotTracked' })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {areOptionsError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Không thể tải dữ liệu tạo sản phẩm</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>Hãy tải lại danh mục và đơn vị tính trước khi lưu sản phẩm.</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetryOptions}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(form.formState.errors.productName)} className="sm:col-span-2">
          <FieldLabel htmlFor="productName">Tên sản phẩm *</FieldLabel>
          <Input
            id="productName"
            aria-invalid={Boolean(form.formState.errors.productName)}
            placeholder="Ví dụ: Pin AA…"
            className="h-10 rounded-lg text-sm"
            {...form.register('productName')}
          />
          <FieldError
            errors={
              form.formState.errors.productName ? [form.formState.errors.productName] : undefined
            }
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.sku)}>
          <FieldLabel htmlFor="sku">Mã SKU *</FieldLabel>
          <Input
            id="sku"
            aria-invalid={Boolean(form.formState.errors.sku)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Ví dụ: SKU-A001…"
            className="h-10 rounded-lg font-mono text-sm"
            {...form.register('sku')}
          />
          <FieldError
            errors={form.formState.errors.sku ? [form.formState.errors.sku] : undefined}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.unitId)}>
          <FieldLabel htmlFor="unitId">Đơn vị tính *</FieldLabel>
          <NativeSelect
            id="unitId"
            className="w-full"
            aria-invalid={Boolean(form.formState.errors.unitId)}
            disabled={areOptionsLoading || areOptionsError}
            {...form.register('unitId')}
          >
            <NativeSelectOption value="">
              {areOptionsLoading ? 'Đang tải…' : 'Chọn đơn vị…'}
            </NativeSelectOption>
            {units.map((u) => (
              <NativeSelectOption key={u.id} value={u.id}>
                {u.unitName}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError
            errors={form.formState.errors.unitId ? [form.formState.errors.unitId] : undefined}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.categoryId)}>
          <FieldLabel htmlFor="categoryId">Danh mục *</FieldLabel>
          <NativeSelect
            id="categoryId"
            className="w-full"
            aria-invalid={Boolean(form.formState.errors.categoryId)}
            disabled={areOptionsLoading || areOptionsError}
            {...form.register('categoryId')}
          >
            <NativeSelectOption value="">
              {areOptionsLoading ? 'Đang tải…' : 'Chọn danh mục…'}
            </NativeSelectOption>
            {categories.map((c) => (
              <NativeSelectOption key={c.id} value={c.id}>
                {c.categoryName}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError
            errors={
              form.formState.errors.categoryId ? [form.formState.errors.categoryId] : undefined
            }
          />
        </Field>

        <FieldSet className="sm:col-span-2">
          <FieldLegend variant="label">Phương thức quản lý tồn kho</FieldLegend>
          <RadioGroup
            aria-label="Phương thức quản lý tồn kho"
            value={isLotTracked ? 'lot' : 'quantity'}
            onValueChange={(value) => {
              const isLotTracked = value === 'lot'
              form.setValue('isLotTracked', isLotTracked, { shouldDirty: true })
              if (!isLotTracked) form.setValue('shelfLifeDays', null)
            }}
          >
            <Field orientation="horizontal">
              <RadioGroupItem id="create-tracking-quantity" value="quantity" />
              <FieldLabel htmlFor="create-tracking-quantity" className="font-normal">
                Theo số lượng
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="create-tracking-lot" value="lot" />
              <FieldLabel htmlFor="create-tracking-lot" className="font-normal">
                Theo lô
              </FieldLabel>
            </Field>
          </RadioGroup>
          <FieldDescription>
            Theo lô hỗ trợ truy xuất nguồn gốc và hạn sử dụng của từng lô hàng.
          </FieldDescription>
        </FieldSet>

        {isLotTracked ? (
          <Field
            data-invalid={Boolean(form.formState.errors.shelfLifeDays)}
            className="sm:col-span-2"
          >
            <FieldLabel htmlFor="shelfLifeDays">Số ngày sử dụng dự kiến</FieldLabel>
            <Input
              id="shelfLifeDays"
              type="number"
              min={1}
              autoComplete="off"
              aria-invalid={Boolean(form.formState.errors.shelfLifeDays)}
              placeholder="Ví dụ: 365 ngày…"
              {...form.register('shelfLifeDays', {
                setValueAs: (value) => (value === '' ? null : Number(value)),
              })}
            />
            <FieldError
              errors={
                form.formState.errors.shelfLifeDays
                  ? [form.formState.errors.shelfLifeDays]
                  : undefined
              }
            />
          </Field>
        ) : null}
      </FieldGroup>

      <DialogFooter className="mt-6">
        <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
          <X data-icon="inline-start" aria-hidden="true" />
          Hủy
        </Button>
        <Button type="submit" disabled={isPending || areOptionsLoading || areOptionsError}>
          {isPending ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Lưu sản phẩm
        </Button>
      </DialogFooter>
    </form>
  )
}

interface CreateProductDialogProps extends ProductReferenceOptionsProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CreateProductFormValues) => void
}

export function CreateProductDialog({
  units,
  categories,
  areOptionsLoading,
  areOptionsError,
  onRetryOptions,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: CreateProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>
        <CreateProductForm
          units={units}
          categories={categories}
          areOptionsLoading={areOptionsLoading}
          areOptionsError={areOptionsError}
          onRetryOptions={onRetryOptions}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface UpdateProductDialogProps extends ProductReferenceOptionsProps {
  readonly open: boolean
  readonly product: ProductResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: UpdateProductFormValues) => void
}

export function UpdateProductDialog({
  units,
  categories,
  areOptionsLoading,
  areOptionsError,
  onRetryOptions,
  open,
  product,
  isPending,
  onOpenChange,
  onSubmit,
}: UpdateProductDialogProps) {
  const form = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      productName: product.productName,
      unitId: product.unitId,
      categoryId: product.categoryId ?? '',
      isLotTracked: product.isLotTracked,
      shelfLifeDays: product.shelfLifeDays,
    },
  })
  const isLotTracked = useWatch({ control: form.control, name: 'isLotTracked' })

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {areOptionsError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Không thể tải dữ liệu sản phẩm</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-2">
                <span>Hãy tải lại danh mục và đơn vị tính trước khi lưu thay đổi.</span>
                <Button type="button" variant="outline" size="sm" onClick={onRetryOptions}>
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              data-invalid={Boolean(form.formState.errors.productName)}
              className="sm:col-span-2"
            >
              <FieldLabel htmlFor="edit-productName">Tên sản phẩm *</FieldLabel>
              <Input
                id="edit-productName"
                aria-invalid={Boolean(form.formState.errors.productName)}
                placeholder="Ví dụ: Pin AA…"
                className="h-10 rounded-lg text-sm"
                {...form.register('productName')}
              />
              <FieldError
                errors={
                  form.formState.errors.productName
                    ? [form.formState.errors.productName]
                    : undefined
                }
              />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.unitId)}>
              <FieldLabel htmlFor="edit-unitId">Đơn vị tính *</FieldLabel>
              <NativeSelect
                id="edit-unitId"
                className="w-full"
                aria-invalid={Boolean(form.formState.errors.unitId)}
                disabled={areOptionsLoading || areOptionsError}
                {...form.register('unitId')}
              >
                <NativeSelectOption value="">
                  {areOptionsLoading ? 'Đang tải…' : 'Chọn đơn vị…'}
                </NativeSelectOption>
                {units.map((u) => (
                  <NativeSelectOption key={u.id} value={u.id}>
                    {u.unitName}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                errors={form.formState.errors.unitId ? [form.formState.errors.unitId] : undefined}
              />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.categoryId)}>
              <FieldLabel htmlFor="edit-categoryId">Danh mục *</FieldLabel>
              <NativeSelect
                id="edit-categoryId"
                className="w-full"
                aria-invalid={Boolean(form.formState.errors.categoryId)}
                disabled={areOptionsLoading || areOptionsError}
                {...form.register('categoryId')}
              >
                <NativeSelectOption value="">
                  {areOptionsLoading ? 'Đang tải…' : 'Chọn danh mục…'}
                </NativeSelectOption>
                {categories.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.categoryName}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                errors={
                  form.formState.errors.categoryId ? [form.formState.errors.categoryId] : undefined
                }
              />
            </Field>

            <FieldSet className="sm:col-span-2" data-disabled={!product.canChangeTrackingMode}>
              <FieldLegend variant="label">Phương thức quản lý tồn kho</FieldLegend>
              <RadioGroup
                aria-label="Phương thức quản lý tồn kho"
                value={isLotTracked ? 'lot' : 'quantity'}
                disabled={!product.canChangeTrackingMode}
                onValueChange={(value) => {
                  const isLotTracked = value === 'lot'
                  form.setValue('isLotTracked', isLotTracked, { shouldDirty: true })
                  if (!isLotTracked) form.setValue('shelfLifeDays', null, { shouldDirty: true })
                }}
              >
                <Field orientation="horizontal" data-disabled={!product.canChangeTrackingMode}>
                  <RadioGroupItem id="edit-tracking-quantity" value="quantity" />
                  <FieldLabel htmlFor="edit-tracking-quantity" className="font-normal">
                    Theo số lượng
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal" data-disabled={!product.canChangeTrackingMode}>
                  <RadioGroupItem id="edit-tracking-lot" value="lot" />
                  <FieldLabel htmlFor="edit-tracking-lot" className="font-normal">
                    Theo lô
                  </FieldLabel>
                </Field>
              </RadioGroup>
              {!product.canChangeTrackingMode ? (
                <FieldDescription>
                  Không thể thay đổi phương thức quản lý tồn kho vì sản phẩm đã phát sinh dữ liệu
                  kho.
                </FieldDescription>
              ) : null}
            </FieldSet>

            {isLotTracked ? (
              <Field
                data-invalid={Boolean(form.formState.errors.shelfLifeDays)}
                className="sm:col-span-2"
              >
                <FieldLabel htmlFor="edit-shelfLifeDays">Số ngày sử dụng dự kiến</FieldLabel>
                <Input
                  id="edit-shelfLifeDays"
                  type="number"
                  min={1}
                  autoComplete="off"
                  aria-invalid={Boolean(form.formState.errors.shelfLifeDays)}
                  placeholder="Ví dụ: 365 ngày…"
                  {...form.register('shelfLifeDays', {
                    setValueAs: (value) => (value === '' ? null : Number(value)),
                  })}
                />
                <FieldError
                  errors={
                    form.formState.errors.shelfLifeDays
                      ? [form.formState.errors.shelfLifeDays]
                      : undefined
                  }
                />
              </Field>
            ) : null}
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
                isPending || areOptionsLoading || areOptionsError || !form.formState.isDirty
              }
            >
              {isPending ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
