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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Spinner } from '@/components/ui/spinner'
import type { IssueStockFormValues } from '../../schemas/outbound.schema'
import type { OutboundOrderSummary } from '../../types/outbound.types'
import { formatOutboundQuantity } from '../../utils/outbound-format'

interface IssueStockDialogProps {
  readonly order: OutboundOrderSummary | null
  readonly form: UseFormReturn<IssueStockFormValues>
  readonly isPending: boolean
  readonly inventorySearch: string
  readonly onInventorySearchChange: (value: string) => void
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: IssueStockFormValues) => Promise<void>
  readonly inventoryOptions: readonly {
    productId: string
    slotId: string
    label: string
    availableQuantity: number
  }[]
}

export function IssueStockDialog({
  order,
  form,
  isPending,
  onOpenChange,
  onSubmit,
  inventoryOptions,
  inventorySearch,
  onInventorySearchChange,
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="bg-muted/40 border p-3">
                <p className="truncate font-mono text-sm font-medium" translate="no">
                  {order.orderCode}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {order.customerName} · {order.warehouseName}
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="issue-inventory-search">Tìm vị trí tồn</FieldLabel>
                <Input
                  id="issue-inventory-search"
                  name="issueInventorySearch"
                  autoComplete="off"
                  placeholder="Tìm SKU hoặc sản phẩm…"
                  value={inventorySearch}
                  onChange={(event) => onInventorySearchChange(event.target.value)}
                />
              </Field>

              <FieldGroup>
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
                        · Còn lại {formatOutboundQuantity(line.remainingQuantity)}
                      </p>
                      <Input
                        id={inputId}
                        type="number"
                        min={0}
                        max={line.remainingQuantity}
                        step="0.01"
                        inputMode="decimal"
                        disabled={isPending}
                        aria-invalid={Boolean(lineError)}
                        {...form.register(`lines.${index}.pickedQuantity`, { valueAsNumber: true })}
                      />
                      <NativeSelect
                        aria-label={`Vị trí lấy ${line.productName}`}
                        {...form.register(`lines.${index}.sourceSlotId`)}
                      >
                        <NativeSelectOption value="">Chọn vị trí lấy</NativeSelectOption>
                        {inventoryOptions
                          .filter((option) => option.productId === line.productId)
                          .map((option) => (
                            <NativeSelectOption key={option.slotId} value={option.slotId}>
                              {option.label} · khả dụng {option.availableQuantity}
                            </NativeSelectOption>
                          ))}
                      </NativeSelect>
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
              </FieldGroup>

              <FieldError errors={linesError?.root ? [linesError.root] : undefined} />
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Xác nhận xuất kho
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
