'use client'

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
import { Textarea } from '@/components/ui/textarea'
import type { ApproveTransferFormValues } from '../../schemas/transfer.schema'
import type { TransferSummary } from '../../types/transfer.types'

export function ApproveTransferDialog({
  transfer,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  readonly transfer: TransferSummary | null
  readonly form: UseFormReturn<ApproveTransferFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ApproveTransferFormValues) => Promise<void>
}) {
  return (
    <Dialog open={Boolean(transfer)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Duyệt phiếu điều chuyển</DialogTitle>
          <DialogDescription>Có thể giảm số lượng duyệt theo tồn kho thực tế.</DialogDescription>
        </DialogHeader>
        {transfer ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {form.watch('lines').map((line, index) => (
              <Field
                key={line.stockTransferItemId}
                data-invalid={Boolean(form.formState.errors.lines?.[index])}
              >
                <FieldLabel htmlFor={`approve-transfer-${index}`}>
                  {line.productName} · yêu cầu {line.requestedQuantity}
                </FieldLabel>
                <Input
                  id={`approve-transfer-${index}`}
                  type="number"
                  min={0}
                  max={line.requestedQuantity}
                  disabled={isPending}
                  {...form.register(`lines.${index}.approvedQuantity`, { valueAsNumber: true })}
                />
                <FieldError
                  errors={
                    form.formState.errors.lines?.[index]?.approvedQuantity
                      ? [form.formState.errors.lines[index].approvedQuantity]
                      : undefined
                  }
                />
              </Field>
            ))}
            <Field>
              <FieldLabel htmlFor="approve-transfer-note">Ghi chú</FieldLabel>
              <Textarea id="approve-transfer-note" {...form.register('note')} />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang duyệt...' : 'Xác nhận duyệt'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
