'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowLeft, CalendarIcon, Plus, Save, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import type { InboundRequestFormValues } from '../../schemas/inbound-request.schema'
import { LookupCombobox, type LookupOption } from './LookupCombobox'

interface InboundRequestFormProps {
  readonly title: string
  readonly description: string
  readonly currency: string
  readonly form: UseFormReturn<InboundRequestFormValues>
  readonly fields: readonly FieldArrayWithId<InboundRequestFormValues, 'lines', 'id'>[]
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
  readonly onProductSearchChange: (scope: string, value: string) => void
}

export function InboundRequestForm({
  title,
  description,
  currency,
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
}: InboundRequestFormProps) {
  const isMobile = useIsMobile()
  const [selectedProductOptions, setSelectedProductOptions] = useState<
    Record<string, LookupOption>
  >({})
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form
  const lines = watch('lines')
  const totalQuantity = lines.reduce((total, line) => total + (Number(line.quantity) || 0), 0)

  function rememberProductOption(scope: string, option?: LookupOption) {
    setSelectedProductOptions((current) => {
      if (option) {
        const existing = current[scope]
        if (existing?.value === option.value && existing.label === option.label) return current
        return { ...current, [scope]: option }
      }

      if (!current[scope]) return current
      const next = { ...current }
      delete next[scope]
      return next
    })
  }

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
            <p className="text-primary text-xs font-medium">Nhập kho</p>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{description}</p>
          </div>
        </div>
        <FormActions
          isPending={isPending}
          onSaveDraft={onSaveDraft}
          onSaveAndSubmit={onSaveAndSubmit}
        />
      </header>

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          onSaveAndSubmit()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Thông tin yêu cầu nhập kho</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
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
                <DatePickerField
                  id="expectedDate"
                  label="Ngày nhận dự kiến"
                  value={watch('expectedDate')}
                  onChange={(value) =>
                    setValue('expectedDate', value, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
            <CardAction>
              <Button type="button" variant="outline" size="sm" onClick={onAddLine}>
                <Plus aria-hidden="true" />
                Thêm dòng
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldLegend className="sr-only">Sản phẩm</FieldLegend>
              {errors.lines?.root?.message ? (
                <FieldError>{errors.lines.root.message}</FieldError>
              ) : null}
              {isMobile ? (
                <div className="divide-y border">
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
                        inputId={`mobile-product-${index}`}
                        searchScope={field.id}
                        selectedOption={selectedProductOptions[field.id]}
                        onSelectedOptionChange={rememberProductOption}
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
                        <FieldLabel htmlFor={`mobile-unit-price-${index}`}>
                          Đơn giá ({currency})
                        </FieldLabel>
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
              ) : (
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="w-36">Số lượng</TableHead>
                      <TableHead className="w-44">Đơn giá ({currency})</TableHead>
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
                            inputId={`desktop-product-${index}`}
                            searchScope={field.id}
                            selectedOption={selectedProductOptions[field.id]}
                            onSelectedOptionChange={rememberProductOption}
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
              )}
            </FieldSet>
          </CardContent>
          <CardFooter className="text-muted-foreground justify-between gap-3">
            <span>{fields.length} dòng sản phẩm</span>
            <span>Tổng SL: {totalQuantity}</span>
          </CardFooter>
        </Card>

        <Card>
          <CardFooter className="justify-end gap-2">
            <FormActions isPending={isPending} onSaveDraft={onSaveDraft} />
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

function DatePickerField({
  id,
  label,
  value,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
}) {
  const selectedDate = parseDateInputValue(value)

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
            aria-label={label}
          >
            <CalendarIcon data-icon="inline-start" aria-hidden="true" />
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onChange(date ? toDateInputValue(date) : '')}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

function parseDateInputValue(value: string): Date | undefined {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined

  return new Date(year, month - 1, day)
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function FormActions({
  isPending,
  onSaveDraft,
  onSaveAndSubmit,
}: {
  readonly isPending: boolean
  readonly onSaveDraft: () => void
  readonly onSaveAndSubmit?: () => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button type="button" variant="outline" disabled={isPending} onClick={onSaveDraft}>
        <Save aria-hidden="true" />
        Lưu nháp
      </Button>
      <Button
        type={onSaveAndSubmit ? 'button' : 'submit'}
        disabled={isPending}
        onClick={onSaveAndSubmit}
      >
        <Send aria-hidden="true" />
        Lưu và gửi duyệt
      </Button>
    </div>
  )
}

function ProductSelect({
  inputId,
  searchScope,
  selectedOption,
  onSelectedOptionChange,
  index,
  form,
  options,
  isLoading,
  onSearchChange,
}: {
  readonly inputId: string
  readonly searchScope: string
  readonly selectedOption?: LookupOption
  readonly onSelectedOptionChange: (scope: string, option?: LookupOption) => void
  readonly index: number
  readonly form: UseFormReturn<InboundRequestFormValues>
  readonly options: readonly LookupOption[]
  readonly isLoading: boolean
  readonly onSearchChange: (scope: string, value: string) => void
}) {
  const error = form.formState.errors.lines?.[index]?.productId
  return (
    <Field data-invalid={Boolean(error)}>
      <LookupCombobox
        id={inputId}
        value={form.watch(`lines.${index}.productId`)}
        options={options}
        selectedOption={selectedOption}
        placeholder="Chọn hoặc tìm sản phẩm"
        emptyMessage="Không tìm thấy sản phẩm phù hợp."
        ariaLabel={`Sản phẩm dòng ${index + 1}`}
        isLoading={isLoading}
        isInvalid={Boolean(error)}
        onSearchChange={(value) => onSearchChange(searchScope, value)}
        onChange={(value, option) => {
          onSelectedOptionChange(searchScope, option)
          form.setValue(`lines.${index}.productId`, value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }}
      />
      <FieldError>{error?.message}</FieldError>
    </Field>
  )
}
