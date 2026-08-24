'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { createProductSchema, updateProductSchema } from '../schemas/product.schema'
import type { CreateProductFormValues, UpdateProductFormValues } from '../schemas/product.schema'
import { useCategoriesQuery, useUnitsQuery } from '../hooks/use-products'
import type { ProductResponse } from '../types/product.types'

interface CreateProductFormProps {
  readonly isPending: boolean
  readonly onSubmit: (values: CreateProductFormValues) => void
  readonly onCancel: () => void
}

export function CreateProductForm({ isPending, onSubmit, onCancel }: CreateProductFormProps) {
  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: '',
      productName: '',
      unitId: '',
      categoryId: '',
      minStockThreshold: undefined,
    },
  })
  const unitsQuery = useUnitsQuery()
  const categoriesQuery = useCategoriesQuery()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(form.formState.errors.productName)} className="sm:col-span-2">
          <FieldLabel htmlFor="productName">Tên sản phẩm *</FieldLabel>
          <Input
            id="productName"
            autoFocus
            placeholder="Nhập tên sản phẩm"
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
            placeholder="Vd: SKU-A001"
            className="h-10 rounded-lg font-mono text-sm"
            {...form.register('sku')}
          />
          <FieldError
            errors={form.formState.errors.sku ? [form.formState.errors.sku] : undefined}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.unitId)}>
          <FieldLabel htmlFor="unitId">Đơn vị tính *</FieldLabel>
          <select
            id="unitId"
            className="border-input bg-background h-10 w-full rounded-lg border px-3 text-sm"
            disabled={unitsQuery.isLoading}
            {...form.register('unitId')}
          >
            <option value="">{unitsQuery.isLoading ? 'Đang tải...' : 'Chọn đơn vị...'}</option>
            {(unitsQuery.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.unitName}
              </option>
            ))}
          </select>
          <FieldError
            errors={form.formState.errors.unitId ? [form.formState.errors.unitId] : undefined}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.categoryId)}>
          <FieldLabel htmlFor="categoryId">Danh mục *</FieldLabel>
          <select
            id="categoryId"
            className="border-input bg-background h-10 w-full rounded-lg border px-3 text-sm"
            disabled={categoriesQuery.isLoading}
            {...form.register('categoryId')}
          >
            <option value="">
              {categoriesQuery.isLoading ? 'Đang tải...' : 'Chọn danh mục...'}
            </option>
            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <FieldError
            errors={
              form.formState.errors.categoryId ? [form.formState.errors.categoryId] : undefined
            }
          />
        </Field>

        <Field
          data-invalid={Boolean(form.formState.errors.minStockThreshold)}
          className="sm:col-span-2"
        >
          <FieldLabel htmlFor="minStockThreshold">
            Ngưỡng tồn kho tối thiểu
            <span className="text-muted-foreground ml-1 text-xs font-normal">(tùy chọn)</span>
          </FieldLabel>
          <Input
            id="minStockThreshold"
            type="number"
            min={0}
            placeholder="Vd: 10"
            className="h-10 rounded-lg text-sm"
            {...form.register('minStockThreshold', { valueAsNumber: true })}
          />
          <FieldError
            errors={
              form.formState.errors.minStockThreshold
                ? [form.formState.errors.minStockThreshold]
                : undefined
            }
          />
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
          <X className="size-4" aria-hidden="true" />
          Hủy
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          Lưu sản phẩm
        </Button>
      </DialogFooter>
    </form>
  )
}

interface CreateProductDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CreateProductFormValues) => void
}

export function CreateProductDialog({
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
          isPending={isPending}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface UpdateProductDialogProps {
  readonly open: boolean
  readonly product: ProductResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: UpdateProductFormValues) => void
}

export function UpdateProductDialog({
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
    },
  })
  const unitsQuery = useUnitsQuery()
  const categoriesQuery = useCategoriesQuery()

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              data-invalid={Boolean(form.formState.errors.productName)}
              className="sm:col-span-2"
            >
              <FieldLabel htmlFor="edit-productName">Tên sản phẩm *</FieldLabel>
              <Input
                id="edit-productName"
                autoFocus
                placeholder="Nhập tên sản phẩm"
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
              <select
                id="edit-unitId"
                className="border-input bg-background h-10 w-full rounded-lg border px-3 text-sm"
                disabled={unitsQuery.isLoading}
                {...form.register('unitId')}
              >
                <option value="">{unitsQuery.isLoading ? 'Đang tải...' : 'Chọn đơn vị...'}</option>
                {(unitsQuery.data ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitName}
                  </option>
                ))}
              </select>
              <FieldError
                errors={form.formState.errors.unitId ? [form.formState.errors.unitId] : undefined}
              />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.categoryId)}>
              <FieldLabel htmlFor="edit-categoryId">Danh mục *</FieldLabel>
              <select
                id="edit-categoryId"
                className="border-input bg-background h-10 w-full rounded-lg border px-3 text-sm"
                disabled={categoriesQuery.isLoading}
                {...form.register('categoryId')}
              >
                <option value="">
                  {categoriesQuery.isLoading ? 'Đang tải...' : 'Chọn danh mục...'}
                </option>
                {(categoriesQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
              <FieldError
                errors={
                  form.formState.errors.categoryId ? [form.formState.errors.categoryId] : undefined
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
              <X className="size-4" aria-hidden="true" />
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
