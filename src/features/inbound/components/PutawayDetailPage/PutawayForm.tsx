'use client'

import { ArrowLeft, Ban, PackageCheck, Plus, Trash2 } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useWatch, type FieldArrayWithId, type UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Spinner } from '@/components/ui/spinner'
import { APP_ROUTES } from '@/routes/app-routes'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { PutawayFormValues } from '../../schemas/inbound.schema'
import {
  getPutawayAllocationState,
  getPutawayFillRemaining,
} from '../../schemas/putaway-allocation.schema'
import { formatPutawayQuantity, getPutawayRemainingInput } from '../../utils/putaway-units'
import {
  hasPutawayPlan,
  isPutawayReasonValid,
  type PutawayPlanDeviation,
} from '../../utils/putaway-plan'
import { cn } from '@/lib/utils'
import type { GoodsReceiptDetail } from '../../types/inbound.types'
import { PutawayDeviationPanel, type PutawayEvidenceState } from './PutawayDeviationPanel'
import { PutawayLocationSelect } from './PutawayLocationSelect'
import { PutawayPlanNotice } from './PutawayPlanNotice'

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
  readonly hasUncertainSubmission?: boolean
  readonly planDeviation: PutawayPlanDeviation
  readonly evidence: PutawayEvidenceState
  readonly canCancel: boolean
  readonly cancelLabel?: string
  readonly onCancel: () => void
  readonly onApplyPlan: () => void
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
  hasUncertainSubmission = false,
  planDeviation,
  evidence,
  canCancel,
  cancelLabel = 'Hủy phần còn lại',
  onCancel,
  onApplyPlan,
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
  const overrideReason = useWatch({ control: form.control, name: 'overrideReason' })
  const reasonMissing = planDeviation.requiresReason && !isPutawayReasonValid(overrideReason)
  const reasonError =
    reasonMissing && (isSubmitted || (overrideReason ?? '').length > 0)
      ? 'Vui lòng nhập lý do (tối thiểu 5 ký tự) khi cất khác kế hoạch.'
      : null
  const allocationLocked = isPending || hasUncertainSubmission
  const allocation = getPutawayAllocationState(lines, receipt.items, slots)
  const pendingItems = receipt.items.filter((item) => item.remainingPutAwayQuantity > 0)
  const fullyAllocated = pendingItems.filter(
    (item) =>
      (allocation.assignedByItem.get(item.id) ?? 0) ===
      Math.round(item.remainingPutAwayQuantity * 100)
  ).length

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link
              href={APP_ROUTES.inboundPutaway as Route}
              aria-label="Quay lại danh sách"
              aria-disabled={allocationLocked}
              onClick={(event) => {
                if (allocationLocked) event.preventDefault()
              }}
            >
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
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
          {canCancel ? (
            <Button
              type="button"
              variant="destructive"
              disabled={allocationLocked}
              onClick={onCancel}
            >
              <Ban aria-hidden="true" />
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={
              isPending || (!hasUncertainSubmission && (!allocation.canSubmit || reasonMissing))
            }
            aria-busy={isPending}
            onClick={onSubmit}
          >
            {isPending ? (
              <Spinner
                aria-hidden="true"
                data-icon="inline-start"
                className="motion-reduce:animate-none"
              />
            ) : (
              <PackageCheck aria-hidden="true" data-icon="inline-start" />
            )}
            {isPending
              ? 'Đang xử lý…'
              : hasUncertainSubmission
                ? 'Gửi lại an toàn'
                : 'Xác nhận cất hàng'}
          </Button>
        </div>
      </header>
      <section className="bg-card border">
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
          <Metric label="Dòng hàng cần cất" value={String(pendingItems.length)} />
          <Metric label="Dòng đã phân bổ đủ" value={String(fullyAllocated)} />
          <Metric
            label="Dòng còn phải phân bổ"
            value={String(pendingItems.length - fullyAllocated)}
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
                    Còn phải cất: {formatPutawayQuantity(item, item.remainingPutAwayQuantity)} ·
                    Đang nhập: {formatPutawayQuantity(item, requested)} · Sau phân bổ còn:{' '}
                    {formatPutawayQuantity(
                      item,
                      Math.max(
                        0,
                        item.remainingPutAwayQuantity -
                          (allocation.assignedByItem.get(item.id) ?? 0) / 100
                      )
                    )}
                    {excess > 0 ? ` · Vượt ${formatPutawayQuantity(item, excess)}` : ''}
                  </span>
                </div>
              )
            })}
        </div>
      </section>
      <PutawayPlanNotice receipt={receipt} disabled={allocationLocked} onApplyPlan={onApplyPlan} />
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={allocationLocked}
            onClick={onAdd}
          >
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
              line.enteredQuantity !== 1
            const lineErrors = showErrors ? row.errors : {}
            const selectedItemId = line.goodsReceiptItemId
            const selectedItem = receipt.items.find((item) => item.id === selectedItemId)
            const fillRemaining = getPutawayFillRemaining(lines, index, receipt.items, slots)
            return (
              <FieldGroup
                key={field.id}
                className="grid gap-3 p-4 *:min-w-0 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,.8fr)_auto]"
              >
                <Field data-invalid={Boolean(lineErrors.goodsReceiptItemId)}>
                  <FieldLabel htmlFor={`putaway-item-${index}`}>Sản phẩm</FieldLabel>
                  <NativeSelect
                    id={`putaway-item-${index}`}
                    className="w-full"
                    disabled={allocationLocked}
                    aria-invalid={Boolean(lineErrors.goodsReceiptItemId)}
                    aria-describedby={`putaway-item-${index}-error`}
                    value={selectedItemId}
                    onChange={(event) => {
                      setValue(`lines.${index}.goodsReceiptItemId`, event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      const item = receipt.items.find(
                        (candidate) => candidate.id === event.target.value
                      )
                      const input = item
                        ? getPutawayRemainingInput(item, item.remainingPutAwayQuantity)
                        : null
                      setValue(`lines.${index}.enteredUnitId`, input?.enteredUnitId ?? '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue(`lines.${index}.enteredQuantity`, 1, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
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
                      Còn phải cất:{' '}
                      {formatPutawayQuantity(selectedItem, selectedItem.remainingPutAwayQuantity)}
                    </p>
                  ) : null}
                </Field>
                <Field data-invalid={Boolean(lineErrors.slotId)}>
                  <FieldLabel htmlFor={`putaway-slot-${index}`}>Cất vào vị trí</FieldLabel>
                  <PutawayLocationSelect
                    id={`putaway-slot-${index}`}
                    invalid={Boolean(lineErrors.slotId)}
                    disabled={allocationLocked}
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
                  {selectedItem && hasPutawayPlan(selectedItem) ? (
                    <p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                      {planDeviation.offPlanRows.has(index) ? (
                        <Badge variant="outline" className="border-warning text-warning">
                          Khác kế hoạch
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Theo kế hoạch</Badge>
                      )}
                    </p>
                  ) : null}
                </Field>
                <Field
                  data-invalid={Boolean(lineErrors.enteredQuantity)}
                  data-disabled={allocationLocked}
                >
                  <FieldLabel htmlFor={`putaway-quantity-${index}`}>Số lượng cất</FieldLabel>
                  <Input
                    id={`putaway-quantity-${index}`}
                    type="number"
                    min={10 ** -(row.unit?.quantityPrecision ?? 0)}
                    step={10 ** -(row.unit?.quantityPrecision ?? 0)}
                    max={row.maxQuantity}
                    disabled={allocationLocked}
                    aria-invalid={Boolean(lineErrors.enteredQuantity)}
                    aria-describedby={`putaway-quantity-${index}-error putaway-conversion-${index}`}
                    {...register(`lines.${index}.enteredQuantity`, { valueAsNumber: true })}
                  />
                  <p
                    id={`putaway-conversion-${index}`}
                    className="text-muted-foreground text-xs"
                    aria-live="polite"
                  >
                    {selectedItem && row.baseQuantity !== null
                      ? `= ${formatQuantity(row.baseQuantity)} ${selectedItem.baseUnitName}`
                      : 'Chọn đơn vị và nhập số lượng để xem quy đổi.'}
                  </p>
                  <FieldError id={`putaway-quantity-${index}-error`}>
                    {lineErrors.enteredQuantity}
                  </FieldError>
                </Field>
                <Field
                  data-invalid={Boolean(lineErrors.enteredUnitId)}
                  data-disabled={allocationLocked}
                >
                  <FieldLabel htmlFor={`putaway-unit-${index}`}>Đơn vị cất</FieldLabel>
                  <NativeSelect
                    id={`putaway-unit-${index}`}
                    className="w-full"
                    disabled={allocationLocked || !selectedItem}
                    value={line.enteredUnitId}
                    aria-invalid={Boolean(lineErrors.enteredUnitId)}
                    aria-describedby={`putaway-unit-${index}-error putaway-unit-${index}-description`}
                    onChange={(event) => {
                      const unitId = event.target.value
                      const input =
                        selectedItem && row.baseQuantity !== null
                          ? getPutawayRemainingInput(selectedItem, row.baseQuantity, unitId)
                          : null
                      setValue(`lines.${index}.enteredUnitId`, unitId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue(
                        `lines.${index}.enteredQuantity`,
                        input?.enteredUnitId === unitId ? input.enteredQuantity : Number.NaN,
                        { shouldDirty: true, shouldValidate: true }
                      )
                    }}
                  >
                    <NativeSelectOption value="">Chọn đơn vị</NativeSelectOption>
                    {(selectedItem?.allowedUnits ?? []).map((unit) => (
                      <NativeSelectOption key={unit.unitId} value={unit.unitId}>
                        {unit.unitName}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {selectedItem && row.unit ? (
                    <FieldDescription
                      id={`putaway-unit-${index}-description`}
                      className="break-words"
                    >
                      1 {row.unit.unitName} = {formatQuantity(row.unit.conversionFactor)}{' '}
                      {selectedItem.baseUnitName}
                    </FieldDescription>
                  ) : null}
                  <FieldError id={`putaway-unit-${index}-error`}>
                    {lineErrors.enteredUnitId}
                  </FieldError>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={allocationLocked || !fillRemaining}
                    onClick={() => {
                      if (!fillRemaining) return
                      setValue(`lines.${index}.enteredUnitId`, fillRemaining.enteredUnitId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue(`lines.${index}.enteredQuantity`, fillRemaining.enteredQuantity, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                  >
                    Cất toàn bộ còn lại
                  </Button>
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={allocationLocked}
                    aria-label={`Xóa phân bổ ${index + 1}`}
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </FieldGroup>
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
      {planDeviation.requiresReason ? (
        <PutawayDeviationPanel
          form={form}
          reasonError={reasonError}
          disabled={allocationLocked}
          evidence={evidence}
        />
      ) : null}
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
