import type { UseFormReturn } from 'react-hook-form'
import { TriangleAlert } from 'lucide-react'
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
import type { ReportDamagedStockFormValues } from '../../schemas/report-damaged-stock.schema'
import type { InventoryBalance } from '../../types/inventory.types'
import { formatInventoryQuantity } from '../../utils/inventory-format'

interface ReportDamagedStockDialogProps {
  readonly item: InventoryBalance | null
  readonly form: UseFormReturn<ReportDamagedStockFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ReportDamagedStockFormValues) => Promise<void>
}

export function ReportDamagedStockDialog({
  item,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: ReportDamagedStockDialogProps) {
  const quantityError = form.formState.errors.quantity
  const reasonError = form.formState.errors.reason
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo hàng hỏng</DialogTitle>
          <DialogDescription>
            Ghi nhận hàng không còn sử dụng được và trừ khỏi tồn kho.
          </DialogDescription>
        </DialogHeader>
        {item ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="border-destructive/25 bg-destructive/5 flex items-start gap-3 border p-3">
              <TriangleAlert className="text-destructive mt-0.5 size-4" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.productName || 'Sản phẩm chưa xác định'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  <span className="font-mono">{item.sku || item.productId}</span> ·{' '}
                  {item.warehouseName || item.warehouseId} / {item.slotCode || item.slotId}
                </p>
                <p className="mt-1 text-xs">
                  Có thể báo hỏng:{' '}
                  <strong className="font-mono tabular-nums">
                    {formatInventoryQuantity(item.availableQuantity)}
                  </strong>
                </p>
              </div>
            </div>
            <Field data-invalid={Boolean(quantityError)}>
              <FieldLabel htmlFor="damaged-quantity">Số lượng hàng hỏng</FieldLabel>
              <Input
                id="damaged-quantity"
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
            <Field data-invalid={Boolean(reasonError)}>
              <FieldLabel htmlFor="damaged-reason">Lý do</FieldLabel>
              <Textarea
                id="damaged-reason"
                rows={4}
                placeholder="Mô tả tình trạng và nguyên nhân"
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
                {isPending ? 'Đang ghi nhận...' : 'Xác nhận hàng hỏng'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
