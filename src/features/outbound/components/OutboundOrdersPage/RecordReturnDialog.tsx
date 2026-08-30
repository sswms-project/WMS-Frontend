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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import type { RecordReturnFormValues } from '../../schemas/outbound.schema'
import type { OutboundOrderSummary } from '../../types/outbound.types'

export function RecordReturnDialog({
  order,
  form,
  isPending,
  slotOptions,
  allowableByProduct,
  slotSearch,
  onSlotSearchChange,
  onOpenChange,
  onSubmit,
}: {
  readonly order: OutboundOrderSummary | null
  readonly form: UseFormReturn<RecordReturnFormValues>
  readonly isPending: boolean
  readonly slotOptions: readonly { id: string; label: string }[]
  readonly allowableByProduct: Readonly<Record<string, number>>
  readonly slotSearch: string
  readonly onSlotSearchChange: (value: string) => void
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: RecordReturnFormValues) => Promise<void>
}) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ghi nhận hoàn hàng</DialogTitle>
          <DialogDescription>
            Số lượng tối đa đã trừ các yêu cầu hoàn chưa bị từ chối.
          </DialogDescription>
        </DialogHeader>
        {order ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.reason)}>
                <FieldLabel htmlFor="return-reason">Lý do</FieldLabel>
                <Textarea id="return-reason" {...form.register('reason')} />
                <FieldError errors={[form.formState.errors.reason]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="return-slot-search">Tìm vị trí nhập lại</FieldLabel>
                <Input
                  id="return-slot-search"
                  name="returnSlotSearch"
                  autoComplete="off"
                  placeholder="Tìm mã vị trí…"
                  value={slotSearch}
                  onChange={(event) => onSlotSearchChange(event.target.value)}
                />
              </Field>
              {form.watch('lines').map((line, index) => (
                <FieldGroup key={line.productId} className="grid gap-3 border p-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium">
                      {order.items.find((item) => item.productId === line.productId)?.productName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Có thể hoàn: {allowableByProduct[line.productId] ?? 0}
                    </p>
                  </div>
                  <Field data-invalid={Boolean(form.formState.errors.lines?.[index]?.quantity)}>
                    <FieldLabel htmlFor={`return-quantity-${index}`}>Số lượng</FieldLabel>
                    <Input
                      id={`return-quantity-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      max={allowableByProduct[line.productId] ?? 0}
                      {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <FieldError errors={[form.formState.errors.lines?.[index]?.quantity]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`return-condition-${index}`}>Tình trạng</FieldLabel>
                    <NativeSelect
                      id={`return-condition-${index}`}
                      {...form.register(`lines.${index}.condition`)}
                    >
                      <NativeSelectOption value="Good">Còn tốt</NativeSelectOption>
                      <NativeSelectOption value="Damaged">Hư hỏng</NativeSelectOption>
                    </NativeSelect>
                    {line.condition === 'Good' ? (
                      <NativeSelect
                        aria-label="Vị trí nhập lại"
                        {...form.register(`lines.${index}.restockSlotId`)}
                      >
                        <NativeSelectOption value="">Chọn vị trí nhập lại</NativeSelectOption>
                        {slotOptions.map((slot) => (
                          <NativeSelectOption key={slot.id} value={slot.id}>
                            {slot.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    ) : null}
                  </Field>
                </FieldGroup>
              ))}
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Tạo yêu cầu hoàn
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
