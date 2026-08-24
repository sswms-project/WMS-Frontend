'use client'

import { ArrowLeft, Plus, Save, Send, Trash2 } from 'lucide-react'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { PurchaseOrderFormValues } from '../../schemas/purchase-order.schema'
import { LookupCombobox, type LookupOption } from './LookupCombobox'

interface PurchaseOrderFormProps {
  readonly title: string
  readonly description: string
  readonly form: UseFormReturn<PurchaseOrderFormValues>
  readonly fields: readonly FieldArrayWithId<PurchaseOrderFormValues, 'lines', 'id'>[]
  readonly warehouseOptions: readonly LookupOption[]
  readonly supplierOptions: readonly LookupOption[]
  readonly productOptions: readonly LookupOption[]
  readonly isWarehouseSearchLoading: boolean
  readonly isSupplierSearchLoading: boolean
  readonly isProductSearchLoading: boolean
  readonly isPending: boolean
  readonly onAddLine: () => void
  readonly onRemoveLine: (index: number) => void
  readonly onCancel: () => void
  readonly onSaveDraft: () => void
  readonly onSaveAndSubmit: () => void
  readonly onWarehouseSearchChange: (value: string) => void
  readonly onSupplierSearchChange: (value: string) => void
  readonly onProductSearchChange: (value: string) => void
}

export function PurchaseOrderForm({
  title,
  description,
  form,
  fields,
  warehouseOptions,
  supplierOptions,
  productOptions,
  isWarehouseSearchLoading,
  isSupplierSearchLoading,
  isProductSearchLoading,
  isPending,
  onAddLine,
  onRemoveLine,
  onCancel,
  onSaveDraft,
  onSaveAndSubmit,
  onWarehouseSearchChange,
  onSupplierSearchChange,
  onProductSearchChange,
}: PurchaseOrderFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Quay lại"
            onClick={onCancel}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <div>
            <p className="text-primary text-xs font-medium">Mua hàng</p>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" disabled={isPending} onClick={onSaveDraft}>
            <Save aria-hidden="true" />
            Lưu nháp
          </Button>
          <Button type="button" disabled={isPending} onClick={onSaveAndSubmit}>
            <Send aria-hidden="true" />
            Lưu và gửi duyệt
          </Button>
        </div>
      </header>

      <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
        <FieldSet>
          <FieldLegend>Thông tin đơn mua</FieldLegend>
          <FieldGroup className="grid gap-4 md:grid-cols-3">
            <Field data-invalid={Boolean(errors.warehouseId)}>
              <FieldLabel htmlFor="warehouseId">Kho nhận hàng</FieldLabel>
              <LookupCombobox
                id="warehouseId"
                value={watch('warehouseId')}
                options={warehouseOptions}
                placeholder="Chọn hoặc tìm kho"
                emptyMessage="Không tìm thấy kho phù hợp."
                ariaLabel="Kho nhận hàng"
                isLoading={isWarehouseSearchLoading}
                isInvalid={Boolean(errors.warehouseId)}
                onSearchChange={onWarehouseSearchChange}
                onChange={(value) =>
                  setValue('warehouseId', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <FieldError>{errors.warehouseId?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.supplierId)}>
              <FieldLabel htmlFor="supplierId">Nhà cung cấp</FieldLabel>
              <LookupCombobox
                id="supplierId"
                value={watch('supplierId')}
                options={supplierOptions}
                placeholder="Chọn hoặc tìm nhà cung cấp"
                emptyMessage="Không tìm thấy nhà cung cấp phù hợp."
                ariaLabel="Nhà cung cấp"
                isLoading={isSupplierSearchLoading}
                isInvalid={Boolean(errors.supplierId)}
                onSearchChange={onSupplierSearchChange}
                onChange={(value) =>
                  setValue('supplierId', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <FieldError>{errors.supplierId?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="expectedDate">Ngày nhận dự kiến</FieldLabel>
              <Input id="expectedDate" type="date" {...register('expectedDate')} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <div className="flex items-center justify-between gap-3">
            <FieldLegend className="mb-0">Sản phẩm</FieldLegend>
            <Button type="button" variant="outline" size="sm" onClick={onAddLine}>
              <Plus aria-hidden="true" />
              Thêm dòng
            </Button>
          </div>
          {errors.lines?.root?.message ? (
            <FieldError>{errors.lines.root.message}</FieldError>
          ) : null}
          <div className="bg-card border">
            <div className="hidden overflow-x-auto md:block">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="w-36">Số lượng</TableHead>
                    <TableHead className="w-44">Đơn giá (VND)</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Xóa</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="align-top">
                        <ProductSelect
                          index={index}
                          form={form}
                          options={productOptions}
                          isLoading={isProductSearchLoading}
                          onSearchChange={onProductSearchChange}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          aria-label={`Số lượng dòng ${index + 1}`}
                          aria-invalid={Boolean(errors.lines?.[index]?.quantity)}
                          {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                        />
                        <FieldError>{errors.lines?.[index]?.quantity?.message}</FieldError>
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          aria-label={`Đơn giá dòng ${index + 1}`}
                          aria-invalid={Boolean(errors.lines?.[index]?.unitPrice)}
                          {...register(`lines.${index}.unitPrice`, {
                            setValueAs: (value: string) => (value === '' ? null : Number(value)),
                          })}
                        />
                        <FieldError>{errors.lines?.[index]?.unitPrice?.message}</FieldError>
                      </TableCell>
                      <TableCell className="align-top">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Xóa dòng ${index + 1}`}
                              disabled={fields.length === 1}
                              onClick={() => onRemoveLine(index)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xóa dòng</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y md:hidden">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-3 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Dòng {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Xóa dòng ${index + 1}`}
                      disabled={fields.length === 1}
                      onClick={() => onRemoveLine(index)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                  <ProductSelect
                    index={index}
                    form={form}
                    options={productOptions}
                    isLoading={isProductSearchLoading}
                    onSearchChange={onProductSearchChange}
                  />
                  <Field>
                    <FieldLabel htmlFor={`mobile-quantity-${index}`}>Số lượng</FieldLabel>
                    <Input
                      id={`mobile-quantity-${index}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      aria-invalid={Boolean(errors.lines?.[index]?.quantity)}
                      {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <FieldError>{errors.lines?.[index]?.quantity?.message}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`mobile-unit-price-${index}`}>Đơn giá (VND)</FieldLabel>
                    <Input
                      id={`mobile-unit-price-${index}`}
                      type="number"
                      min="0"
                      step="1000"
                      aria-invalid={Boolean(errors.lines?.[index]?.unitPrice)}
                      {...register(`lines.${index}.unitPrice`, {
                        setValueAs: (value: string) => (value === '' ? null : Number(value)),
                      })}
                    />
                    <FieldError>{errors.lines?.[index]?.unitPrice?.message}</FieldError>
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </FieldSet>
      </form>
    </div>
  )
}

function ProductSelect({
  index,
  form,
  options,
  isLoading,
  onSearchChange,
}: {
  readonly index: number
  readonly form: UseFormReturn<PurchaseOrderFormValues>
  readonly options: readonly LookupOption[]
  readonly isLoading: boolean
  readonly onSearchChange: (value: string) => void
}) {
  const error = form.formState.errors.lines?.[index]?.productId
  return (
    <Field data-invalid={Boolean(error)}>
      <LookupCombobox
        id={`product-${index}`}
        value={form.watch(`lines.${index}.productId`)}
        options={options}
        placeholder="Chọn hoặc tìm sản phẩm"
        emptyMessage="Không tìm thấy sản phẩm phù hợp."
        ariaLabel={`Sản phẩm dòng ${index + 1}`}
        isLoading={isLoading}
        isInvalid={Boolean(error)}
        onSearchChange={onSearchChange}
        onChange={(value) =>
          form.setValue(`lines.${index}.productId`, value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
      <FieldError>{error?.message}</FieldError>
    </Field>
  )
}
