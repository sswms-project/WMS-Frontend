'use client'

import { ImagePlus, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
  readonly onSubmit: (
    values: CreateProductFormValues,
    createAnother: boolean,
    imageFile: File | null
  ) => Promise<boolean>
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const baseUnitId = useWatch({ control: form.control, name: 'unitId' })
  const {
    fields: conversionFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'unitConversions',
  })

  useEffect(() => {
    if (!imagePreviewUrl) return
    return () => URL.revokeObjectURL(imagePreviewUrl)
  }, [imagePreviewUrl])

  function clearImage() {
    setImageFile(null)
    setImagePreviewUrl(null)
    setImageError(null)
  }

  function openImagePicker() {
    const input = imageInputRef.current
    if (!input) return
    input.value = ''
    input.click()
  }

  async function save(values: CreateProductFormValues, createAnother: boolean) {
    const saved = await onSubmit(values, createAnother, imageFile)
    if (saved) {
      clearImage()
      if (createAnother) form.reset()
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
      <FieldGroup className="bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
        <Field data-invalid={Boolean(form.formState.errors.productName)} className="md:col-span-2">
          <FieldLabel htmlFor="productName">Tên sản phẩm *</FieldLabel>
          <Input
            id="productName"
            aria-invalid={Boolean(form.formState.errors.productName)}
            placeholder="Ví dụ: Pin AA…"
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
            className="font-mono"
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

        <div className="flex flex-col gap-4">
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

          <FieldSet className="bg-muted/30 rounded-md border p-4">
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
        </div>

        <Field className="md:col-start-2" data-invalid={Boolean(imageError)}>
          <FieldLabel htmlFor="productImage">Ảnh sản phẩm</FieldLabel>
          <input
            ref={imageInputRef}
            id="productImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Chọn ảnh sản phẩm từ thiết bị"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              event.target.value = ''
              if (!file) return
              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setImageError('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.')
                return
              }
              if (file.size > 5 * 1024 * 1024) {
                setImageError('Ảnh sản phẩm không được vượt quá 5 MB.')
                return
              }
              setImageFile(file)
              setImagePreviewUrl(URL.createObjectURL(file))
              setImageError(null)
            }}
          />
          <button
            type="button"
            aria-label={imageFile ? 'Thay đổi ảnh sản phẩm' : 'Chọn ảnh sản phẩm'}
            onClick={openImagePicker}
            className="bg-muted/20 hover:bg-muted/50 focus-visible:ring-ring relative flex size-28 items-center justify-center overflow-hidden border border-dashed transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:size-32"
          >
            {imagePreviewUrl ? (
              <Image
                src={imagePreviewUrl}
                alt={`Xem trước ảnh ${imageFile?.name ?? 'sản phẩm'}`}
                fill
                unoptimized
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <span className="text-muted-foreground flex flex-col items-center gap-2 text-xs">
                <ImagePlus aria-hidden="true" />
                Chọn ảnh
              </span>
            )}
          </button>
          <div className="mt-2 flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={openImagePicker}>
              <Upload data-icon="inline-start" aria-hidden="true" />
              Tải ảnh lên
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Xóa ảnh sản phẩm"
              title="Xóa ảnh"
              disabled={!imageFile}
              onClick={clearImage}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
          <FieldDescription>
            Ảnh được tải lên khi lưu sản phẩm. JPG, PNG hoặc WebP, tối đa 5 MB.
          </FieldDescription>
          {imageError ? (
            <p role="alert" className="text-destructive text-xs">
              {imageError}
            </p>
          ) : null}
        </Field>

        {isLotTracked ? (
          <Field
            data-invalid={Boolean(form.formState.errors.shelfLifeDays)}
            className="md:col-span-2"
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
        <Field className="md:col-span-2" data-invalid={Boolean(form.formState.errors.description)}>
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

      <Accordion type="multiple" className="mt-4 rounded-lg border px-4">
        <AccordionItem value="conversions">
          <AccordionTrigger>Đơn vị chuyển đổi</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <p className="text-muted-foreground text-xs">
              Khai báo khi hàng hóa được nhập, xuất bằng đơn vị khác đơn vị tính chính.
            </p>
            <div className="max-h-64 overflow-auto border">
              <table className="w-full min-w-[600px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[20%]" />
                  <col />
                  <col className="w-12" />
                </colgroup>
                <thead className="bg-muted/60 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Đơn vị chuyển đổi</th>
                    <th className="px-3 py-2 text-left font-medium">Tỷ lệ quy đổi</th>
                    <th className="px-3 py-2 text-left font-medium">Mô tả quy đổi</th>
                    <th className="px-2">
                      <span className="sr-only">Xóa</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversionFields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-muted-foreground px-3 py-3 text-center text-xs"
                      >
                        Chưa khai báo đơn vị chuyển đổi.
                      </td>
                    </tr>
                  ) : (
                    conversionFields.map((field, index) => {
                      const conversionUnitId = form.watch(`unitConversions.${index}.unitId`)
                      const factor = form.watch(`unitConversions.${index}.conversionFactor`)
                      const conversionUnit = units.find((unit) => unit.id === conversionUnitId)
                      const baseUnit = units.find((unit) => unit.id === baseUnitId)
                      return (
                        <tr key={field.id} className="border-t align-top">
                          <td className="p-2">
                            <NativeSelect
                              className="w-full min-w-0"
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
                              className="w-full min-w-0"
                              aria-label={`Tỷ lệ quy đổi dòng ${index + 1}`}
                              type="number"
                              min="0.000001"
                              step="any"
                              {...form.register(`unitConversions.${index}.conversionFactor`, {
                                valueAsNumber: true,
                              })}
                            />
                          </td>
                          <td className="text-muted-foreground px-3 py-3 break-words whitespace-normal">
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
                    })
                  )}
                </tbody>
              </table>
            </div>
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

      <SheetFooter className="bg-popover sticky -bottom-5 z-10 -mx-5 mt-6 border-t px-5 py-4 sm:flex-row sm:justify-end">
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
  readonly onSubmit: (
    values: CreateProductFormValues,
    createAnother: boolean,
    imageFile: File | null
  ) => Promise<boolean>
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
      <SheetContent className="w-full max-w-full overflow-hidden overscroll-contain data-[side=right]:w-full data-[side=right]:sm:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-4/5 data-[side=right]:lg:w-2/3 data-[side=right]:xl:w-1/2">
        <SheetHeader className="shrink-0 border-b px-5 py-4 pr-12">
          <SheetTitle className="text-base font-semibold">Thêm sản phẩm mới</SheetTitle>
          <SheetDescription>
            Khai báo thông tin nhận diện, đơn vị tính và phương thức quản lý tồn kho.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <CreateProductForm
            key={open ? 'open' : 'closed'}
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
      <SheetContent className="w-full max-w-full overflow-hidden overscroll-contain data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-4/5 data-[side=right]:lg:w-2/3 data-[side=right]:xl:w-1/2">
        <SheetHeader className="shrink-0 border-b px-5 py-4 pr-12">
          <SheetTitle className="text-base font-semibold">Chỉnh sửa sản phẩm</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin sản phẩm và phương thức quản lý tồn kho.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
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
            <FieldGroup className="bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
              <Field
                data-invalid={Boolean(form.formState.errors.productName)}
                className="md:col-span-2"
              >
                <FieldLabel htmlFor="edit-productName">Tên sản phẩm *</FieldLabel>
                <Input
                  id="edit-productName"
                  aria-invalid={Boolean(form.formState.errors.productName)}
                  placeholder="Ví dụ: Pin AA…"
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

              <FieldSet
                className="bg-muted/30 rounded-md border p-4 md:col-span-2"
                data-disabled={!product.canChangeTrackingMode}
              >
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
                  className="md:col-span-2"
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
                className="md:col-span-2"
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

            <SheetFooter className="bg-popover sticky -bottom-5 z-10 -mx-5 mt-6 border-t px-5 py-4 sm:flex-row sm:justify-end">
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
