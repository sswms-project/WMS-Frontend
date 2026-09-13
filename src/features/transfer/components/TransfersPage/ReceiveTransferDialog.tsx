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
import type { ReceiveTransferFormValues } from '../../schemas/transfer.schema'
import type { TransferSummary } from '../../types/transfer.types'

export function ReceiveTransferDialog({
  transfer,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  readonly transfer: TransferSummary | null
  readonly form: UseFormReturn<ReceiveTransferFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ReceiveTransferFormValues) => Promise<void>
}) {
  return (
    <Dialog open={Boolean(transfer)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nhận hàng điều chuyển</DialogTitle>
          <DialogDescription>
            Ghi nhận đủ số đã xuất vào ba nhóm: nhận tốt, hư hỏng và thiếu.
          </DialogDescription>
        </DialogHeader>
        {transfer ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {form.watch('lines').map((line, index) => (
              <div key={line.stockTransferItemId} className="space-y-3 border p-3">
                <p className="text-sm font-medium">
                  {line.productName} · đã xuất {line.dispatchedQuantity}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(['receivedQuantity', 'damagedQuantity', 'missingQuantity'] as const).map(
                    (field, fieldIndex) => (
                      <Field
                        key={field}
                        data-invalid={Boolean(form.formState.errors.lines?.[index]?.[field])}
                      >
                        <FieldLabel htmlFor={`receive-transfer-${index}-${field}`}>
                          {['Nhận tốt', 'Hư hỏng', 'Thiếu'][fieldIndex]}
                        </FieldLabel>
                        <Input
                          id={`receive-transfer-${index}-${field}`}
                          type="number"
                          min={0}
                          disabled={isPending}
                          {...form.register(`lines.${index}.${field}`, { valueAsNumber: true })}
                        />
                        <FieldError
                          errors={
                            form.formState.errors.lines?.[index]?.[field]
                              ? [form.formState.errors.lines[index][field]]
                              : undefined
                          }
                        />
                      </Field>
                    )
                  )}
                </div>
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang ghi nhận...' : 'Xác nhận nhận hàng'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
