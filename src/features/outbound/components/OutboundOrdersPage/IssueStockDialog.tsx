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
import type { IssueStockFormValues } from '../../schemas/outbound.schema'
import type { OutboundOrderSummary } from '../../types/outbound.types'
import { formatOutboundQuantity } from '../../utils/outbound-format'

interface IssueStockDialogProps {
  readonly order: OutboundOrderSummary | null
  readonly form: UseFormReturn<IssueStockFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: IssueStockFormValues) => Promise<void>
}

export function IssueStockDialog({
  order,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: IssueStockDialogProps) {
  const lines = form.watch('lines')
  const linesError = form.formState.errors.lines

  return (
    <Dialog open={Boolean(order)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lấy hàng &amp; xuất kho</DialogTitle>
          <DialogDescription>
            Nhập số lượng thực tế lấy được cho từng sản phẩm trong đơn.
          </DialogDescription>
        </DialogHeader>
        {order ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-muted/40 border p-3">
              <p className="truncate font-mono text-sm font-medium" translate="no">
                {order.orderCode}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {order.customerName} · {order.warehouseName}
              </p>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => {
                const lineError = form.formState.errors.lines?.[index]
                const inputId = `issue-stock-line-${index}`

                return (
                  <Field key={line.outboundOrderItemId} data-invalid={Boolean(lineError)}>
                    <FieldLabel htmlFor={inputId}>
                      <span className="truncate">{line.productName}</span>
                    </FieldLabel>
                    <p className="text-muted-foreground text-xs">
                      <span className="font-mono" translate="no">
                        {line.sku}
                      </span>{' '}
                      · Đặt {formatOutboundQuantity(line.orderedQuantity)}
                    </p>
                    <Input
                      id={inputId}
                      type="number"
                      min={0}
                      max={line.orderedQuantity}
                      step={1}
                      inputMode="numeric"
                      disabled={isPending}
                      aria-invalid={Boolean(lineError)}
                      {...form.register(`lines.${index}.pickedQuantity`, { valueAsNumber: true })}
                    />
                    <FieldError
                      errors={
                        lineError?.pickedQuantity
                          ? [lineError.pickedQuantity]
                          : lineError?.sourceSlotId
                            ? [lineError.sourceSlotId]
                            : undefined
                      }
                    />
                  </Field>
                )
              })}
            </div>

            <FieldError errors={linesError?.root ? [linesError.root] : undefined} />

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
                {isPending ? 'Đang xuất kho...' : 'Xác nhận xuất kho'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
