import { Plus } from 'lucide-react'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import type { LookupOption } from '@/features/inbound-request/types/inbound-request.types'
import type { TransferRequestFormValues } from '../../schemas/transfer-request.schema'
import type { TransferAvailability } from '../../types/transfer.types'
import { TransferLineRow, type TransferLineLockInfo } from './TransferLineRow'

export interface WarehouseSelectOption {
  readonly id: string
  readonly name: string
}

export type TransferFormMode = 'create' | 'draft' | 'edit'

interface TransferFormProps {
  readonly form: UseFormReturn<TransferRequestFormValues>
  readonly fields: readonly FieldArrayWithId<TransferRequestFormValues, 'lines', 'id'>[]
  readonly mode: TransferFormMode
  readonly destinationOptions: readonly WarehouseSelectOption[]
  readonly sourceOptions: readonly WarehouseSelectOption[]
  readonly warehousesLocked: boolean
  readonly productOptions: readonly LookupOption[]
  readonly knownProductOptions: Readonly<Record<string, LookupOption>>
  readonly availabilityByProductId: Readonly<Record<string, TransferAvailability>>
  readonly lockByItemId: Readonly<Record<string, TransferLineLockInfo>>
  readonly isProductSearchLoading: boolean
  readonly isSaving: boolean
  readonly onDestinationChange: (value: string) => void
  readonly onSourceChange: (value: string) => void
  readonly onProductSearchChange: (scope: string, value: string) => void
  readonly onAddLine: () => void
  readonly onRemoveLine: (index: number) => void
  readonly onSaveDraft: () => void
  readonly onCancel: () => void
  readonly onSubmit: () => void
}

export function TransferForm({
  form,
  fields,
  mode,
  destinationOptions,
  sourceOptions,
  warehousesLocked,
  productOptions,
  knownProductOptions,
  availabilityByProductId,
  lockByItemId,
  isProductSearchLoading,
  isSaving,
  onDestinationChange,
  onSourceChange,
  onProductSearchChange,
  onAddLine,
  onRemoveLine,
  onSaveDraft,
  onCancel,
  onSubmit,
}: TransferFormProps) {
  const errors = form.formState.errors
  const destinationWarehouseId = form.watch('destinationWarehouseId')
  const sourceWarehouseId = form.watch('sourceWarehouseId')
  const lines = form.watch('lines')
  const isEditingSubmitted = mode === 'edit'

  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <section className="bg-card border p-4" aria-labelledby="transfer-form-general">
        <h2 id="transfer-form-general" className="mb-3 text-sm font-semibold">
          Thông tin chung
        </h2>
        <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field data-invalid={Boolean(errors.destinationWarehouseId)}>
            <FieldLabel htmlFor="transfer-destination">Kho nhập</FieldLabel>
            <NativeSelect
              id="transfer-destination"
              className="w-full"
              disabled={warehousesLocked}
              aria-invalid={Boolean(errors.destinationWarehouseId)}
              value={destinationWarehouseId}
              onChange={(event) => onDestinationChange(event.target.value)}
            >
              <NativeSelectOption value="">Chọn kho nhập</NativeSelectOption>
              {destinationOptions.map((warehouse) => (
                <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{errors.destinationWarehouseId?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.sourceWarehouseId)}>
            <FieldLabel htmlFor="transfer-source">Kho xuất</FieldLabel>
            <NativeSelect
              id="transfer-source"
              className="w-full"
              disabled={warehousesLocked || !destinationWarehouseId}
              aria-invalid={Boolean(errors.sourceWarehouseId)}
              value={sourceWarehouseId}
              onChange={(event) => onSourceChange(event.target.value)}
            >
              <NativeSelectOption value="">
                {destinationWarehouseId ? 'Chọn kho xuất' : 'Chọn kho nhập trước'}
              </NativeSelectOption>
              {sourceOptions.map((warehouse) => (
                <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{errors.sourceWarehouseId?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.requiredBy)}>
            <FieldLabel htmlFor="transfer-required-by">Hạn cần hàng</FieldLabel>
            <Input id="transfer-required-by" type="date" {...form.register('requiredBy')} />
            <FieldError>{errors.requiredBy?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.reason)}>
            <FieldLabel htmlFor="transfer-reason">Lý do điều chuyển</FieldLabel>
            <Input
              id="transfer-reason"
              maxLength={500}
              placeholder="Ví dụ: bổ sung hàng cho kho bán lẻ"
              aria-invalid={Boolean(errors.reason)}
              {...form.register('reason')}
            />
            <FieldError>{errors.reason?.message}</FieldError>
          </Field>
          <Field className="md:col-span-2 xl:col-span-4" data-invalid={Boolean(errors.note)}>
            <FieldLabel htmlFor="transfer-note">Ghi chú</FieldLabel>
            <Textarea
              id="transfer-note"
              rows={2}
              maxLength={1000}
              aria-invalid={Boolean(errors.note)}
              {...form.register('note')}
            />
            <FieldError>{errors.note?.message}</FieldError>
          </Field>
        </FieldGroup>
        {warehousesLocked ? (
          <p className="text-muted-foreground mt-3 text-xs">
            Chỉ đổi được kho khi phiếu chưa có đợt xuất nào.
          </p>
        ) : null}
      </section>

      <section className="bg-card border" aria-labelledby="transfer-form-lines">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
          <div>
            <h2 id="transfer-form-lines" className="text-sm font-semibold">
              Dòng hàng
            </h2>
            <p className="text-muted-foreground text-xs">
              Hệ thống tự phân bổ vị trí và lô theo FEFO/FIFO khi gửi yêu cầu.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onAddLine}>
            <Plus aria-hidden="true" />
            Thêm dòng
          </Button>
        </div>
        <div className="text-muted-foreground bg-muted hidden gap-3 border-b px-3 py-2 text-xs font-medium lg:grid lg:grid-cols-[28px_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_32px]">
          <span>#</span>
          <span>Sản phẩm</span>
          <span>ĐVT</span>
          <span>Số lượng</span>
          <span>SL theo ĐVT chính</span>
          <span>Tồn khả dụng kho xuất</span>
          <span />
        </div>
        {errors.lines?.message || errors.lines?.root?.message ? (
          <p role="alert" className="text-destructive px-3 pt-3 text-xs">
            {errors.lines?.message ?? errors.lines?.root?.message}
          </p>
        ) : null}
        <div className="divide-y">
          {fields.map((field, index) => {
            const line = lines[index]
            const itemId = line?.itemId ?? null
            const productId = line?.productId ?? ''
            return (
              <TransferLineRow
                key={field.id}
                field={field}
                index={index}
                lineCount={fields.length}
                form={form}
                availability={availabilityByProductId[productId]}
                selectedOption={knownProductOptions[productId]}
                options={productOptions}
                isProductSearchLoading={isProductSearchLoading}
                isIdentityLocked={isEditingSubmitted && Boolean(itemId)}
                lockInfo={itemId ? lockByItemId[itemId] : undefined}
                showAvailabilityWarning={!isEditingSubmitted || !itemId}
                onProductSearchChange={onProductSearchChange}
                onRemove={onRemoveLine}
              />
            )
          })}
        </div>
      </section>

      <div className="bg-background sticky bottom-0 flex flex-wrap justify-end gap-2 border-t py-3">
        <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
          Hủy
        </Button>
        {mode !== 'edit' ? (
          <Button type="button" variant="outline" disabled={isSaving} onClick={onSaveDraft}>
            Lưu nháp
          </Button>
        ) : null}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Đang lưu…' : mode === 'edit' ? 'Lưu thay đổi' : 'Tạo yêu cầu'}
        </Button>
      </div>
    </form>
  )
}
