'use client'

import { Save, Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { InboundReceiptFormValues } from '../../schemas/inbound.schema'
import type { ReceivingTask } from '../../types/inbound.types'
import { formatQuantity } from '@/features/purchase-order/utils/purchase-order-format'

interface ReceiveGoodsDialogProps {
  readonly task: ReceivingTask | null
  readonly form: UseFormReturn<InboundReceiptFormValues>
  readonly isPending: boolean
  readonly title?: string
  readonly description?: string
  readonly saveDraftLabel?: string
  readonly mode?: 'create' | 'edit'
  readonly onOpenChange: (open: boolean) => void
  readonly onSaveDraft: () => void
  readonly onSaveAndSubmit: () => void
}

export function ReceiveGoodsDialog({
  task,
  form,
  isPending,
  title,
  description,
  saveDraftLabel = 'Lưu nháp',
  mode = 'create',
  onOpenChange,
  onSaveDraft,
  onSaveAndSubmit,
}: ReceiveGoodsDialogProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form
  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title ?? `Nhận hàng ${task?.poNumber ?? ''}`}</DialogTitle>
          <DialogDescription>
            {description ??
              'Nhập số lượng thực nhận và ghi rõ tình trạng hàng hỏng trước khi lưu phiếu.'}
          </DialogDescription>
        </DialogHeader>
        {task ? (
          <div className="flex flex-col gap-3">
            {task.lines.map((line, index) => {
              const damaged = watch(`lines.${index}.damagedQty`) ?? 0
              const received = watch(`lines.${index}.receivedQty`) ?? 0
              return (
                <section key={line.purchaseOrderItemId} className="border p-3">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{line.productName}</p>
                      <p className="text-muted-foreground font-mono text-xs">{line.productSKU}</p>
                    </div>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {mode === 'edit' ? (
                        <>Số lượng trên phiếu {formatQuantity(received)}</>
                      ) : (
                        <>
                          Đặt {formatQuantity(line.orderedQuantity)} · Đã nhận{' '}
                          {formatQuantity(line.receivedQuantity)} · Còn{' '}
                          {formatQuantity(line.remainingQuantity)}
                        </>
                      )}
                    </p>
                  </div>
                  <input type="hidden" {...register(`lines.${index}.poLineId`)} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field data-invalid={Boolean(errors.lines?.[index]?.receivedQty)}>
                      <FieldLabel htmlFor={`received-${index}`}>Số lượng thực nhận</FieldLabel>
                      <Input
                        id={`received-${index}`}
                        type="number"
                        min="0.01"
                        max={line.remainingQuantity}
                        step="0.01"
                        aria-invalid={Boolean(errors.lines?.[index]?.receivedQty)}
                        {...register(`lines.${index}.receivedQty`, { valueAsNumber: true })}
                      />
                      <FieldError>{errors.lines?.[index]?.receivedQty?.message}</FieldError>
                    </Field>
                    <Field data-invalid={Boolean(errors.lines?.[index]?.damagedQty)}>
                      <FieldLabel htmlFor={`damaged-${index}`}>Số lượng hỏng</FieldLabel>
                      <Input
                        id={`damaged-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        aria-invalid={Boolean(errors.lines?.[index]?.damagedQty)}
                        {...register(`lines.${index}.damagedQty`, { valueAsNumber: true })}
                      />
                      <FieldError>{errors.lines?.[index]?.damagedQty?.message}</FieldError>
                    </Field>
                  </div>
                  {damaged > 0 ? (
                    <Field
                      className="mt-3"
                      data-invalid={Boolean(errors.lines?.[index]?.exceptionReason)}
                    >
                      <FieldLabel htmlFor={`exception-${index}`}>Tình trạng hàng hỏng</FieldLabel>
                      <Input
                        id={`exception-${index}`}
                        maxLength={500}
                        aria-invalid={Boolean(errors.lines?.[index]?.exceptionReason)}
                        {...register(`lines.${index}.exceptionReason`)}
                      />
                      <FieldError>{errors.lines?.[index]?.exceptionReason?.message}</FieldError>
                    </Field>
                  ) : null}
                </section>
              )
            })}
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onSaveDraft}>
            <Save aria-hidden="true" />
            {saveDraftLabel}
          </Button>
          <Button type="button" disabled={isPending} onClick={onSaveAndSubmit}>
            <Send aria-hidden="true" />
            Lưu và gửi duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
