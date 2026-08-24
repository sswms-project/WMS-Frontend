import type { UseFormReturn } from 'react-hook-form'
import { Boxes } from 'lucide-react'
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
import type { ReserveStockFormValues } from '../../schemas/reserve-stock.schema'
import type { InventoryBalance } from '../../types/inventory.types'
import { formatInventoryQuantity } from '../../utils/inventory-format'

interface ReserveStockDialogProps {
  readonly item: InventoryBalance | null
  readonly form: UseFormReturn<ReserveStockFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ReserveStockFormValues) => Promise<void>
}

export function ReserveStockDialog({
  item,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: ReserveStockDialogProps) {
  const quantityError = form.formState.errors.quantity
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giữ tồn kho</DialogTitle>
          <DialogDescription>
            Dành một phần tồn khả dụng cho nghiệp vụ đang xử lý.
          </DialogDescription>
        </DialogHeader>
        {item ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-muted/50 flex items-start gap-3 border p-3">
              <Boxes className="text-primary mt-0.5 size-4" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.productName || 'Sản phẩm chưa xác định'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  <span className="font-mono">{item.sku || item.productId}</span> ·{' '}
                  {item.warehouseName || item.warehouseId} / {item.slotCode || item.slotId}
                </p>
                <p className="mt-1 text-xs">
                  Khả dụng:{' '}
                  <strong className="font-mono tabular-nums">
                    {formatInventoryQuantity(item.availableQuantity)}
                  </strong>
                </p>
              </div>
            </div>
            <Field data-invalid={Boolean(quantityError)}>
              <FieldLabel htmlFor="reserve-quantity">Số lượng cần giữ</FieldLabel>
              <Input
                id="reserve-quantity"
                type="number"
                inputMode="decimal"
                min="0.001"
                step="0.001"
                max={item.availableQuantity}
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
                {isPending ? 'Đang giữ tồn...' : 'Xác nhận giữ tồn'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
