'use client'

import { ArrowLeft, Ban, PackageCheck, Plus, Trash2 } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useWatch, type FieldArrayWithId, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { APP_ROUTES } from '@/routes/app-routes'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { PutawayFormValues } from '../../schemas/inbound.schema'
import { getPutawayAllocationState } from '../../schemas/putaway-allocation.schema'
import { cn } from '@/lib/utils'
import type { GoodsReceiptDetail } from '../../types/inbound.types'
import { PutawayLocationSelect } from './PutawayLocationSelect'

export interface SlotOption {
  id: string
  code: string
  name: string
  zoneId: string
  zoneLabel: string
  hierarchy: string
  allowsMixedProducts?: boolean
  capacityLabel: string
  unavailableReason?: string
}

interface PutawayFormProps {
  readonly receipt: GoodsReceiptDetail
  readonly form: UseFormReturn<PutawayFormValues>
  readonly fields: readonly FieldArrayWithId<PutawayFormValues, 'lines', 'id'>[]
  readonly slots: readonly SlotOption[]
  readonly isPending: boolean
  readonly canCancel: boolean
  readonly cancelLabel?: string
  readonly onCancel: () => void
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
  canCancel,
  cancelLabel = 'Hủy phần còn lại',
  onCancel,
  onAdd,
  onRemove,
  onSubmit,
}: PutawayFormProps) {
  const {
    register,
    setValue,
    formState: { errors, isSubmitted, touchedFields },
  } = form
  const lines = useWatch({ control: form.control, name: 'lines' })
  const allocation = getPutawayAllocationState(lines, receipt.items, slots)
  const totalRemaining = receipt.items.reduce((sum, item) => sum + item.remainingPutAwayQuantity, 0)

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.inboundPutaway as Route} aria-label="Quay lại danh sách">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-primary text-xs font-medium">Cất hàng</p>
            <h1 className="font-mono text-xl font-semibold break-words">{receipt.receiptCode}</h1>
            <p className="text-muted-foreground mt-1 text-xs break-words sm:text-sm">
              {receipt.inboundRequestCode} · {receipt.warehouseName}
            </p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          {canCancel ? (
            <Button type="button" variant="destructive" disabled={isPending} onClick={onCancel}>
              <Ban aria-hidden="true" />
              {cancelLabel}
            </Button>
          ) : null}
          <Button type="button" disabled={isPending || !allocation.canSubmit} onClick={onSubmit}>
            <PackageCheck aria-hidden="true" />
            Xác nhận cất hàng
          </Button>
        </div>
      </header>
      <section className="bg-card border">
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
          <Metric label="Còn phải cất" value={formatQuantity(totalRemaining)} />
          <Metric label="Đã phân bổ hợp lệ" value={formatQuantity(allocation.totalAssigned)} />
          <Metric
            label="Chưa phân bổ"
            value={formatQuantity(
              Math.max(0, Math.round((totalRemaining - allocation.totalAssigned) * 100) / 100)
            )}
          />
        </div>
        <div className="divide-y border-t">
          {receipt.items
            .filter((item) => item.remainingPutAwayQuantity > 0)
            .map((item) => {
              const requested = (allocation.requestedByItem.get(item.id) ?? 0) / 100
              const excess = Math.round((requested - item.remainingPutAwayQuantity) * 100) / 100
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs"
                >
                  <span className="min-w-0 font-medium break-words">
                    {item.productSKU} - {item.productName}
                    {item.lotNumber ? ` · Lô ${item.lotNumber}` : ''}
                  </span>
                  <span
                    className={cn(
                      'tabular-nums',
                      excess > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'
                    )}
                  >
                    Cần cất {formatQuantity(item.remainingPutAwayQuantity)} · Đang nhập{' '}
                    {formatQuantity(requested)}
                    {excess > 0 ? ` · Vượt ${formatQuantity(excess)}` : ''}
                  </span>
                </div>
              )
            })}
        </div>
      </section>
      {errors.root?.server?.message ? <FieldError>{errors.root.server.message}</FieldError> : null}
      <section className="bg-card border">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Chọn vị trí cất cho từng sản phẩm</h2>
            <p className="text-muted-foreground text-xs">
              Chọn vị trí đích để cất từng sản phẩm. Có thể chia một sản phẩm vào nhiều vị trí, giới
              hạn tính riêng theo từng dòng hàng.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onAdd}>
            <Plus aria-hidden="true" />
            Chia sang vị trí khác
          </Button>
        </div>
        <div className="divide-y">
          {fields.map((field, index) => {
            const line = lines[index]
            if (!line) return null
            const row = allocation.rows[index]!
            const showErrors =
              isSubmitted ||
              Boolean(touchedFields.lines?.[index]) ||
              Boolean(line.goodsReceiptItemId || line.slotId) ||
              line.quantity !== 1
            const lineErrors = showErrors ? row.errors : {}
            const selectedItemId = line.goodsReceiptItemId
            const selectedItem = receipt.items.find((item) => item.id === selectedItemId)
            return (
              <div
                key={field.id}
                className="grid gap-3 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(120px,.6fr)_auto]"
              >
                <Field data-invalid={Boolean(lineErrors.goodsReceiptItemId)}>
                  <FieldLabel htmlFor={`putaway-item-${index}`}>Sản phẩm</FieldLabel>
                  <NativeSelect
                    id={`putaway-item-${index}`}
                    className="w-full"
                    disabled={isPending}
                    aria-invalid={Boolean(lineErrors.goodsReceiptItemId)}
                    aria-describedby={`putaway-item-${index}-error`}
                    value={selectedItemId}
                    onChange={(event) =>
                      setValue(`lines.${index}.goodsReceiptItemId`, event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <NativeSelectOption value="">Chọn sản phẩm</NativeSelectOption>
                    {receipt.items
                      .filter(
                        (item) =>
                          item.id === selectedItemId ||
                          (item.inboundRequestItemId &&
                            Math.round(item.remainingPutAwayQuantity * 100) >
                              (allocation.assignedByItem.get(item.id) ?? 0))
                      )
                      .map((item) => (
                        <NativeSelectOption key={item.id} value={item.id}>
                          {item.productSKU} - {item.productName}
                          {item.lotNumber ? ` · Lô ${item.lotNumber}` : ''}
                        </NativeSelectOption>
                      ))}
                  </NativeSelect>
                  <FieldError id={`putaway-item-${index}-error`}>
                    {lineErrors.goodsReceiptItemId}
                  </FieldError>
                  {selectedItem ? (
                    <p className="text-muted-foreground text-xs">
                      Cần cất {formatQuantity(selectedItem.remainingPutAwayQuantity)} · Dòng này tối
                      đa {formatQuantity(row.itemAvailable)}
                    </p>
                  ) : null}
                </Field>
                <Field data-invalid={Boolean(lineErrors.slotId)}>
                  <FieldLabel htmlFor={`putaway-slot-${index}`}>Cất vào vị trí</FieldLabel>
                  <PutawayLocationSelect
                    id={`putaway-slot-${index}`}
                    invalid={Boolean(lineErrors.slotId)}
                    disabled={isPending}
                    slots={slots}
                    value={line.slotId}
                    onChange={(slotId) =>
                      setValue(`lines.${index}.slotId`, slotId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <FieldError id={`putaway-slot-${index}-error`}>{lineErrors.slotId}</FieldError>
                </Field>
                <Field data-invalid={Boolean(lineErrors.quantity)}>
                  <FieldLabel htmlFor={`putaway-quantity-${index}`}>Số lượng</FieldLabel>
                  <Input
                    id={`putaway-quantity-${index}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={row.maxQuantity}
                    disabled={isPending}
                    aria-invalid={Boolean(lineErrors.quantity)}
                    aria-describedby={`putaway-quantity-${index}-error`}
                    {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <FieldError id={`putaway-quantity-${index}-error`}>
                    {lineErrors.quantity}
                  </FieldError>
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
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
        {!allocation.canSubmit ? (
          <p className="text-muted-foreground border-t px-4 py-3 text-xs" role="status">
            Chọn đủ sản phẩm, vị trí và nhập số lượng trong giới hạn để xác nhận. Chỉ các dòng hợp
            lệ được tính vào tổng phân bổ.
          </p>
        ) : null}
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
