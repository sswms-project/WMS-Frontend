'use client'

import { Plus, Save, Trash2, X } from 'lucide-react'
import { useFieldArray, useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { Textarea } from '@/components/ui/textarea'
import { APP_ROUTES } from '@/routes/app-routes'
import { QuickCategoryDialog } from './QuickCategoryDialog'
import type { CategoryFormValues } from '../schemas/master-data.schema'
import type { CreateProductFormValues, UpdateProductFormValues } from '../schemas/product.schema'
import type { CategoryResponse, ProductResponse, UnitResponse } from '../types/product.types'

interface ProductReferenceOptionsProps {
  readonly units: readonly UnitResponse[]
  readonly categories: readonly CategoryResponse[]
  readonly areOptionsLoading: boolean
  readonly areOptionsError: boolean
  readonly onRetryOptions: () => void
  readonly canManageUnits: boolean
  readonly canManageCategories: boolean
}

interface CreateProductFormProps extends ProductReferenceOptionsProps {
  readonly form: UseFormReturn<CreateProductFormValues>
  readonly categoryForm: UseFormReturn<CategoryFormValues>
  readonly isCategoryDialogOpen: boolean
  readonly isPending: boolean
  readonly isCreatingCategory: boolean
  readonly onCreateCategory: (values: CategoryFormValues) => Promise<string | null>
  readonly onSubmit: (values: CreateProductFormValues, createAnother: boolean) => Promise<boolean>
  readonly onCancel: () => void
  readonly onCategoryDialogOpenChange: (open: boolean) => void
}

export function CreateProductForm({
  form,
  categoryForm,
  isCategoryDialogOpen,
  units,
  categories,
  areOptionsLoading,
  areOptionsError,
  onRetryOptions,
  canManageUnits,
  canManageCategories,
  isCreatingCategory,
  onCreateCategory,
  isPending,
  onSubmit,
  onCancel,
  onCategoryDialogOpenChange,
}: CreateProductFormProps) {
  const isLotTracked = useWatch({ control: form.control, name: 'isLotTracked' })
  const baseUnitId = useWatch({ control: form.control, name: 'unitId' })
  const {
    fields: conversionFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'unitConversions',
  })

  async function save(values: CreateProductFormValues, createAnother: boolean) {
    const saved = await onSubmit(values, createAnother)
    if (saved && createAnother) {
      form.reset()
    }
  }

  return (
    <form onSubmit={form.handleSubmit((values) => save(values, false))} noValidate>
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
          <FieldLabel htmlFor="sku">Mã hàng hóa *</FieldLabel>
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
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="unitId">Đơn vị tính *</FieldLabel>
            {canManageUnits ? (
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <a href={APP_ROUTES.units} target="_blank" rel="noreferrer">
                  Thêm đơn vị tính
                </a>
              </Button>
            ) : null}
          </div>
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
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="categoryId">Nhóm vật tư hàng hóa *</FieldLabel>
            {canManageCategories ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => onCategoryDialogOpenChange(true)}
              >
                <Plus aria-hidden="true" />
                Tạo nhóm
              </Button>
            ) : null}
          </div>
          <NativeSelect
            id="categoryId"
            className="w-full"
            aria-invalid={Boolean(form.formState.errors.categoryId)}
            disabled={areOptionsLoading || areOptionsError}
            {...form.register('categoryId')}
          >
            <NativeSelectOption value="">
              {areOptionsLoading ? 'Đang tải…' : 'Chọn nhóm…'}
            </NativeSelectOption>
            {categories.map((c) => (
              <NativeSelectOption key={c.id} value={c.id}>
                {c.categoryPath}
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
        <Field className="sm:col-span-2" data-invalid={Boolean(form.formState.errors.description)}>
          <FieldLabel htmlFor="description">Mô tả</FieldLabel>
          <Textarea
            id="description"
            rows={3}
            placeholder="Ghi chú nhận diện và quản lý hàng hóa…"
            {...form.register('description', { setValueAs: (value) => value || null })}
          />
          <FieldError
            errors={
              form.formState.errors.description ? [form.formState.errors.description] : undefined
            }
          />
        </Field>
      </FieldGroup>

      <Accordion type="multiple" className="mt-4 border-y">
        <AccordionItem value="conversions">
          <AccordionTrigger>Đơn vị chuyển đổi</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <p className="text-muted-foreground text-xs">
              Khai báo khi hàng hóa được nhập, xuất bằng đơn vị khác đơn vị tính chính.
            </p>
            {conversionFields.length > 0 ? (
              <div className="overflow-x-auto border">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Đơn vị chuyển đổi</th>
                      <th className="px-3 py-2 text-left font-medium">Tỷ lệ quy đổi</th>
                      <th className="px-3 py-2 text-left font-medium">Mô tả quy đổi</th>
                      <th className="w-12">
                        <span className="sr-only">Xóa</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversionFields.map((field, index) => {
                      const conversionUnitId = form.watch(`unitConversions.${index}.unitId`)
                      const factor = form.watch(`unitConversions.${index}.conversionFactor`)
                      const conversionUnit = units.find((unit) => unit.id === conversionUnitId)
                      const baseUnit = units.find((unit) => unit.id === baseUnitId)
                      return (
                        <tr key={field.id} className="border-t align-top">
                          <td className="p-2">
                            <NativeSelect
                              aria-label={`Đơn vị chuyển đổi dòng ${index + 1}`}
                              {...form.register(`unitConversions.${index}.unitId`)}
                            >
                              <NativeSelectOption value="">Chọn đơn vị…</NativeSelectOption>
                              {units
                                .filter((unit) => unit.id !== baseUnitId)
                                .map((unit) => (
                                  <NativeSelectOption key={unit.id} value={unit.id}>
                                    {unit.unitName}
                                    {unit.symbol ? ` (${unit.symbol})` : ''}
                                  </NativeSelectOption>
                                ))}
                            </NativeSelect>
                          </td>
                          <td className="p-2">
                            <Input
                              aria-label={`Tỷ lệ quy đổi dòng ${index + 1}`}
                              type="number"
                              min="0.000001"
                              step="any"
                              {...form.register(`unitConversions.${index}.conversionFactor`, {
                                valueAsNumber: true,
                              })}
                            />
                          </td>
                          <td className="text-muted-foreground px-3 py-3">
                            {conversionUnit && baseUnit && factor > 0
                              ? `1 ${conversionUnit.unitName} = ${factor} ${baseUnit.unitName}`
                              : 'Chọn đơn vị và nhập tỷ lệ'}
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Xóa dòng quy đổi ${index + 1}`}
                              onClick={() => remove(index)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ unitId: '', conversionFactor: 1 })}
              >
                <Plus aria-hidden="true" /> Thêm dòng
              </Button>
              {conversionFields.length > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove()}>
                  Xóa hết dòng
                </Button>
              ) : null}
            </div>
            {form.formState.errors.unitConversions?.message ? (
              <p className="text-destructive text-xs">
                {form.formState.errors.unitConversions.message}
              </p>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SheetFooter className="mt-6">
        <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
          <X data-icon="inline-start" aria-hidden="true" />
          Hủy
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || areOptionsLoading || areOptionsError}
          onClick={() => void form.handleSubmit((values) => save(values, true))()}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Lưu và thêm
        </Button>
        <Button type="submit" disabled={isPending || areOptionsLoading || areOptionsError}>
          {isPending ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Lưu sản phẩm
        </Button>
      </SheetFooter>
      <QuickCategoryDialog
        form={categoryForm}
        open={isCategoryDialogOpen}
        categories={categories}
        isPending={isCreatingCategory}
        onOpenChange={onCategoryDialogOpenChange}
        onSubmit={async (values) => {
          const categoryId = await onCreateCategory(values)
          if (!categoryId) return
          form.setValue('categoryId', categoryId, { shouldDirty: true, shouldValidate: true })
          categoryForm.reset()
          onCategoryDialogOpenChange(false)
        }}
      />
    </form>
  )
}

interface CreateProductDialogProps extends ProductReferenceOptionsProps {
  readonly form: UseFormReturn<CreateProductFormValues>
  readonly categoryForm: UseFormReturn<CategoryFormValues>
  readonly isCategoryDialogOpen: boolean
  readonly open: boolean
  readonly isPending: boolean
  readonly isCreatingCategory: boolean
  readonly onCreateCategory: (values: CategoryFormValues) => Promise<string | null>
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CreateProductFormValues, createAnother: boolean) => Promise<boolean>
  readonly onCategoryDialogOpenChange: (open: boolean) => void
}

export function CreateProductDialog({
  form,
  categoryForm,
  isCategoryDialogOpen,
  units,
  categories,
  areOptionsLoading,
  areOptionsError,
  onRetryOptions,
  canManageUnits,
  canManageCategories,
  isCreatingCategory,
  onCreateCategory,
  open,
  isPending,
  onOpenChange,
  onSubmit,
  onCategoryDialogOpenChange,
}: CreateProductDialogProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <SheetContent className="w-full max-w-full overflow-y-auto overscroll-contain sm:max-w-[50vw]">
        <SheetHeader>
          <SheetTitle>Thêm sản phẩm mới</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <CreateProductForm
            form={form}
            categoryForm={categoryForm}
            isCategoryDialogOpen={isCategoryDialogOpen}
            units={units}
            categories={categories}
            areOptionsLoading={areOptionsLoading}
            areOptionsError={areOptionsError}
            onRetryOptions={onRetryOptions}
            canManageUnits={canManageUnits}
            canManageCategories={canManageCategories}
            isCreatingCategory={isCreatingCategory}
            onCreateCategory={onCreateCategory}
            isPending={isPending}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            onCategoryDialogOpenChange={onCategoryDialogOpenChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface UpdateProductDialogProps extends ProductReferenceOptionsProps {
  readonly form: UseFormReturn<UpdateProductFormValues>
  readonly open: boolean
  readonly product: ProductResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: UpdateProductFormValues) => void
}

export function UpdateProductDialog({
  form,
  units,
  categories,
  areOptionsLoading,
  areOptionsError,
  onRetryOptions,
  canManageUnits,
  canManageCategories,
  open,
  product,
  isPending,
  onOpenChange,
  onSubmit,
}: UpdateProductDialogProps) {
  const isLotTracked = useWatch({ control: form.control, name: 'isLotTracked' })

  return (
    <Sheet open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <SheetContent className="w-full max-w-full overflow-y-auto overscroll-contain sm:max-w-xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa sản phẩm</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
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
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor="edit-unitId">Đơn vị tính *</FieldLabel>
                  {canManageUnits ? (
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <a href={APP_ROUTES.units} target="_blank" rel="noreferrer">
                        Quản lý đơn vị tính
                      </a>
                    </Button>
                  ) : null}
                </div>
                <NativeSelect
                  id="edit-unitId"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.unitId)}
                  disabled={areOptionsLoading || areOptionsError || !product.canChangeBaseUnit}
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
                {!product.canChangeBaseUnit ? (
                  <FieldDescription>
                    Không thể thay đổi đơn vị cơ sở vì sản phẩm đã phát sinh dữ liệu kho.
                  </FieldDescription>
                ) : null}
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.categoryId)}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor="edit-categoryId">Nhóm vật tư hàng hóa *</FieldLabel>
                  {canManageCategories ? (
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <a href={APP_ROUTES.categories} target="_blank" rel="noreferrer">
                        Quản lý nhóm
                      </a>
                    </Button>
                  ) : null}
                </div>
                <NativeSelect
                  id="edit-categoryId"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.categoryId)}
                  disabled={areOptionsLoading || areOptionsError}
                  {...form.register('categoryId')}
                >
                  <NativeSelectOption value="">
                    {areOptionsLoading ? 'Đang tải…' : 'Chọn nhóm…'}
                  </NativeSelectOption>
                  {categories.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>
                      {c.categoryPath}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError
                  errors={
                    form.formState.errors.categoryId
                      ? [form.formState.errors.categoryId]
                      : undefined
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
              <Field
                className="sm:col-span-2"
                data-invalid={Boolean(form.formState.errors.description)}
              >
                <FieldLabel htmlFor="edit-description">Mô tả</FieldLabel>
                <Textarea
                  id="edit-description"
                  rows={3}
                  {...form.register('description', { setValueAs: (value) => value || null })}
                />
                <FieldError
                  errors={
                    form.formState.errors.description
                      ? [form.formState.errors.description]
                      : undefined
                  }
                />
              </Field>
            </FieldGroup>

            <SheetFooter className="mt-6">
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
                {isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                Lưu thay đổi
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
