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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RestockReturnFormValues } from '../../schemas/restock-return.schema'
import { RETURN_ITEM_CONDITIONS, type ReturnSummary } from '../../types/outbound.types'
import { RETURN_ITEM_CONDITION_LABELS, formatOutboundQuantity } from '../../utils/outbound-format'

interface RestockSlotOption {
  readonly id: string
  readonly label: string
}

interface RestockReturnDialogProps {
  readonly item: ReturnSummary | null
  readonly form: UseFormReturn<RestockReturnFormValues>
  readonly slots: readonly RestockSlotOption[]
  readonly quarantineSlotId: string | null
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: RestockReturnFormValues) => void
}

export function RestockReturnDialog({
  item,
  form,
  slots,
  quarantineSlotId,
  isPending,
  onOpenChange,
  onSubmit,
}: RestockReturnDialogProps) {
  const lines = form.watch('items')
  const requiresQuarantineSlot = lines.some(
    (line) => line.condition === 'Damaged' || line.condition === 'Expired'
  )

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nhập lại kho {item?.returnCode}</DialogTitle>
          <DialogDescription>
            Xác nhận tình trạng thực tế. Hàng lỗi, hết hạn hoặc thuộc lô bị khóa phải được đưa vào
            vị trí quarantine.
          </DialogDescription>
        </DialogHeader>
        {item ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {requiresQuarantineSlot && !quarantineSlotId ? (
              <p className="border-destructive bg-error-container text-on-error-container border p-3 text-sm">
                Kho này chưa cấu hình vị trí quarantine. Không thể hoàn tất nhập lại kho.
              </p>
            ) : null}
            <div className="max-h-[45vh] overflow-auto border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Tình trạng thực tế</TableHead>
                    <TableHead>Vị trí nhập</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.items.map((line, index) => {
                    const condition = lines[index]?.condition
                    const requiresSlot = condition !== 'Scrap'
                    const mustQuarantine = condition === 'Damaged' || condition === 'Expired'
                    return (
                      <TableRow key={line.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{line.productName}</p>
                          <p className="text-muted-foreground font-mono text-xs">{line.sku}</p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatOutboundQuantity(line.quantity)}
                        </TableCell>
                        <TableCell>
                          <NativeSelect
                            aria-label={`Tình trạng ${line.productName}`}
                            value={condition ?? line.condition}
                            onChange={(event) => {
                              const nextCondition = RETURN_ITEM_CONDITIONS.find(
                                (option) => option === event.target.value
                              )

                              if (!nextCondition) return

                              form.setValue(`items.${index}.condition`, nextCondition, {
                                shouldValidate: true,
                              })
                              if (nextCondition === 'Scrap') {
                                form.setValue(`items.${index}.restockSlotId`, null, {
                                  shouldValidate: true,
                                })
                              } else if (
                                (nextCondition === 'Damaged' || nextCondition === 'Expired') &&
                                quarantineSlotId
                              ) {
                                form.setValue(`items.${index}.restockSlotId`, quarantineSlotId, {
                                  shouldValidate: true,
                                })
                              }
                            }}
                          >
                            {RETURN_ITEM_CONDITIONS.map((value) => (
                              <NativeSelectOption key={value} value={value}>
                                {RETURN_ITEM_CONDITION_LABELS[value]}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </TableCell>
                        <TableCell>
                          {requiresSlot ? (
                            <NativeSelect
                              aria-label={`Vị trí nhập ${line.productName}`}
                              value={lines[index]?.restockSlotId ?? ''}
                              disabled={mustQuarantine}
                              onChange={(event) =>
                                form.setValue(
                                  `items.${index}.restockSlotId`,
                                  event.target.value || null,
                                  { shouldValidate: true }
                                )
                              }
                            >
                              <NativeSelectOption value="">Chọn vị trí</NativeSelectOption>
                              {slots.map((slot) => (
                                <NativeSelectOption key={slot.id} value={slot.id}>
                                  {slot.label}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                          ) : (
                            <span className="text-muted-foreground text-sm">Không nhập kho</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending || (requiresQuarantineSlot && !quarantineSlotId)}
              >
                {isPending ? 'Đang nhập kho…' : 'Xác nhận nhập lại kho'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
