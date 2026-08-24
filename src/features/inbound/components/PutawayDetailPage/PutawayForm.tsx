'use client'

import { ArrowLeft, PackageCheck, Plus, Trash2 } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { APP_ROUTES } from '@/routes/app-routes'
import { formatQuantity } from '@/features/purchase-order/utils/purchase-order-format'
import type { PutawayFormValues } from '../../schemas/inbound.schema'
import type { InboundReceiptDetail } from '../../types/inbound.types'

export interface SlotOption {
  id: string
  code: string
  hierarchy: string
  availableCapacity: number
}

interface PutawayFormProps {
  readonly receipt: InboundReceiptDetail
  readonly form: UseFormReturn<PutawayFormValues>
  readonly fields: readonly FieldArrayWithId<PutawayFormValues, 'lines', 'id'>[]
  readonly slots: readonly SlotOption[]
  readonly isPending: boolean
  readonly onAdd: () => void
  readonly onRemove: (index: number) => void
  readonly onSubmit: () => void
}

export function PutawayForm({
  receipt,
  form,
  fields,
  slots,
  isPending,
  onAdd,
  onRemove,
  onSubmit,
}: PutawayFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form
  const totalRemaining = receipt.items.reduce((sum, item) => sum + item.remainingPutAwayQuantity, 0)
  const totalAssigned = watch('lines').reduce(
    (sum, line) => sum + (Number.isFinite(line.quantity) ? line.quantity : 0),
    0
  )

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.inboundPutaway as Route} aria-label="Quay lại danh sách">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <p className="text-primary text-xs font-medium">Cất hàng</p>
            <h1 className="font-mono text-xl font-semibold">{receipt.receiptCode}</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {receipt.poNumber} · {receipt.warehouseName}
            </p>
          </div>
        </div>
        <Button type="button" disabled={isPending || fields.length === 0} onClick={onSubmit}>
          <PackageCheck aria-hidden="true" />
          Xác nhận cất hàng
        </Button>
      </header>
      <section className="bg-card border">
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
          <Metric label="Còn phải cất" value={formatQuantity(totalRemaining)} />
          <Metric label="Đã phân bổ" value={formatQuantity(totalAssigned)} />
          <Metric label="Chênh lệch" value={formatQuantity(totalRemaining - totalAssigned)} />
        </div>
      </section>
      <section className="bg-card border">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="text-sm font-semibold">Phân bổ vị trí</h2>
            <p className="text-muted-foreground text-xs">
              Có thể chia một sản phẩm vào nhiều vị trí.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus aria-hidden="true" />
            Thêm phân bổ
          </Button>
        </div>
        <div className="divide-y">
          {fields.map((field, index) => {
            const selectedItemId = watch(`lines.${index}.inboundReceiptItemId`)
            const selectedItem = receipt.items.find((item) => item.id === selectedItemId)
            return (
              <div
                key={field.id}
                className="grid gap-3 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(120px,.6fr)_auto]"
              >
                <Field data-invalid={Boolean(errors.lines?.[index]?.inboundReceiptItemId)}>
                  <FieldLabel htmlFor={`putaway-item-${index}`}>Sản phẩm</FieldLabel>
                  <NativeSelect
                    id={`putaway-item-${index}`}
                    className="w-full"
                    aria-invalid={Boolean(errors.lines?.[index]?.inboundReceiptItemId)}
                    value={selectedItemId}
                    onChange={(event) =>
                      setValue(`lines.${index}.inboundReceiptItemId`, event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <NativeSelectOption value="">Chọn sản phẩm</NativeSelectOption>
                    {receipt.items
                      .filter((item) => item.remainingPutAwayQuantity > 0)
                      .map((item) => (
                        <NativeSelectOption key={item.id} value={item.id}>
                          {item.productSKU} - {item.productName}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                  <FieldError>{errors.lines?.[index]?.inboundReceiptItemId?.message}</FieldError>
                  {selectedItem ? (
                    <p className="text-muted-foreground text-xs">
                      Còn {formatQuantity(selectedItem.remainingPutAwayQuantity)}
                    </p>
                  ) : null}
                </Field>
                <Field data-invalid={Boolean(errors.lines?.[index]?.slotId)}>
                  <FieldLabel htmlFor={`putaway-slot-${index}`}>Vị trí lưu trữ</FieldLabel>
                  <NativeSelect
                    id={`putaway-slot-${index}`}
                    className="w-full"
                    aria-invalid={Boolean(errors.lines?.[index]?.slotId)}
                    value={watch(`lines.${index}.slotId`)}
                    onChange={(event) =>
                      setValue(`lines.${index}.slotId`, event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <NativeSelectOption value="">Chọn vị trí</NativeSelectOption>
                    {slots.map((slot) => (
                      <NativeSelectOption key={slot.id} value={slot.id}>
                        {slot.code} · {slot.hierarchy} · trống{' '}
                        {formatQuantity(slot.availableCapacity)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError>{errors.lines?.[index]?.slotId?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.lines?.[index]?.quantity)}>
                  <FieldLabel htmlFor={`putaway-quantity-${index}`}>Số lượng</FieldLabel>
                  <Input
                    id={`putaway-quantity-${index}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    aria-invalid={Boolean(errors.lines?.[index]?.quantity)}
                    {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <FieldError>{errors.lines?.[index]?.quantity?.message}</FieldError>
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Xóa phân bổ ${index + 1}`}
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        {errors.lines?.root?.message ? (
          <div className="border-t p-3">
            <FieldError>{errors.lines.root.message}</FieldError>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}
