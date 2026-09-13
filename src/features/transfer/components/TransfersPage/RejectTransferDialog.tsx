import type { UseFormReturn } from 'react-hook-form'
import { X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import type { RejectTransferFormValues } from '../../schemas/transfer.schema'
import type { TransferSummary } from '../../types/transfer.types'

interface RejectTransferDialogProps {
  readonly transfer: TransferSummary | null
  readonly form: UseFormReturn<RejectTransferFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: RejectTransferFormValues) => Promise<void>
}

export function RejectTransferDialog({
  transfer,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: RejectTransferDialogProps) {
  const reasonError = form.formState.errors.reason

  return (
    <Dialog open={Boolean(transfer)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối phiếu điều chuyển</DialogTitle>
          <DialogDescription>
            Phiếu sẽ chuyển sang trạng thái đã hủy và không thể xuất hàng.
          </DialogDescription>
        </DialogHeader>
        {transfer ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="border-destructive/25 bg-destructive/5 flex items-start gap-3 border p-3">
              <X className="text-destructive mt-0.5 size-4" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-medium" translate="no">
                  {transfer.transferCode}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {transfer.sourceWarehouseName} → {transfer.destinationWarehouseName}
                </p>
                <p className="mt-1 text-xs">
                  <strong className="tabular-nums">{transfer.items.length}</strong> dòng sản phẩm
                </p>
              </div>
            </div>
            <Field data-invalid={Boolean(reasonError)}>
              <FieldLabel htmlFor="reject-transfer-reason">Lý do từ chối</FieldLabel>
              <Textarea
                id="reject-transfer-reason"
                rows={4}
                placeholder="Mô tả lý do từ chối phiếu điều chuyển"
                aria-invalid={Boolean(reasonError)}
                disabled={isPending}
                {...form.register('reason')}
              />
              <FieldError errors={reasonError ? [reasonError] : undefined} />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Đang từ chối...' : 'Từ chối phiếu'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
