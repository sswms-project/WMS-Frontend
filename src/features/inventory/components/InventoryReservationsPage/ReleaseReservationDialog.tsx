import type { UseFormReturn } from 'react-hook-form'
import { LockOpen } from 'lucide-react'
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
import type { ReleaseReservationFormValues } from '../../schemas/release-reservation.schema'
import type { InventoryBalance } from '../../types/inventory.types'
import { formatInventoryQuantity } from '../../utils/inventory-format'

interface ReleaseReservationDialogProps {
  readonly item: InventoryBalance | null
  readonly form: UseFormReturn<ReleaseReservationFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ReleaseReservationFormValues) => Promise<void>
}

export function ReleaseReservationDialog({
  item,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: ReleaseReservationDialogProps) {
  const quantityError = form.formState.errors.quantity
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giải phóng tồn đang giữ</DialogTitle>
          <DialogDescription>Đưa số lượng đã giữ trở lại lượng tồn khả dụng.</DialogDescription>
        </DialogHeader>
        {item ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-muted/50 flex items-start gap-3 border p-3">
              <LockOpen className="text-primary mt-0.5 size-4" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.productName || 'Sản phẩm chưa xác định'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  <span className="font-mono">{item.sku || item.productId}</span> ·{' '}
                  {item.warehouseName || item.warehouseId} / {item.slotCode || item.slotId}
                </p>
                <p className="mt-1 text-xs">
                  Đang giữ:{' '}
                  <strong className="font-mono tabular-nums">
                    {formatInventoryQuantity(item.reservedQuantity)}
                  </strong>
                </p>
              </div>
            </div>
            <Field data-invalid={Boolean(quantityError)}>
              <FieldLabel htmlFor="release-quantity">Số lượng giải phóng</FieldLabel>
              <Input
                id="release-quantity"
                type="number"
                inputMode="decimal"
                min="0.001"
                step="0.001"
                max={item.reservedQuantity}
                aria-invalid={Boolean(quantityError)}
                disabled={isPending}
                {...form.register('quantity', { valueAsNumber: true })}
              />
              <FieldError errors={quantityError ? [quantityError] : undefined} />
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang giải phóng...' : 'Xác nhận giải phóng'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
