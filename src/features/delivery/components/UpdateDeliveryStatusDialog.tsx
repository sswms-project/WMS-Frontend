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
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import type { UpdateDeliveryStatusFormValues } from '../schemas/delivery.schema'
import type { DeliveryTracking } from '../types/delivery.types'
import { DELIVERY_STATUS_LABELS, getNextDeliveryStatuses } from '../utils/delivery-format'

export function UpdateDeliveryStatusDialog({
  item,
  form,
  staff,
  staffSearch,
  onStaffSearchChange,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  readonly item: DeliveryTracking | null
  readonly form: UseFormReturn<UpdateDeliveryStatusFormValues>
  readonly staff: readonly { id: string; label: string }[]
  readonly staffSearch: string
  readonly onStaffSearchChange: (value: string) => void
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: UpdateDeliveryStatusFormValues) => Promise<void>
}) {
  const nextStatus = form.watch('newStatus')
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật giao hàng</DialogTitle>
          <DialogDescription>
            Chỉ các bước chuyển hợp lệ từ trạng thái hiện tại được hiển thị.
          </DialogDescription>
        </DialogHeader>
        {item ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.newStatus)}>
                <FieldLabel htmlFor="delivery-next-status">Trạng thái mới</FieldLabel>
                <NativeSelect id="delivery-next-status" {...form.register('newStatus')}>
                  <NativeSelectOption value="">Chọn trạng thái</NativeSelectOption>
                  {getNextDeliveryStatuses(item.currentStatus).map((status) => (
                    <NativeSelectOption key={status} value={status}>
                      {DELIVERY_STATUS_LABELS[status]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError errors={[form.formState.errors.newStatus]} />
              </Field>
              {nextStatus === 'AssignedToTransport' ? (
                <Field data-invalid={Boolean(form.formState.errors.assignedDeliveryStaffId)}>
                  <FieldLabel htmlFor="delivery-staff">Nhân viên giao hàng</FieldLabel>
                  <Input
                    id="delivery-staff-search"
                    name="deliveryStaffSearch"
                    autoComplete="off"
                    placeholder="Tìm tên hoặc email…"
                    value={staffSearch}
                    onChange={(event) => onStaffSearchChange(event.target.value)}
                  />
                  <NativeSelect
                    id="delivery-staff"
                    value={form.watch('assignedDeliveryStaffId') ?? ''}
                    onChange={(e) =>
                      form.setValue('assignedDeliveryStaffId', e.target.value || null, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <NativeSelectOption value="">Chọn nhân viên đang hoạt động</NativeSelectOption>
                    {staff.map((person) => (
                      <NativeSelectOption key={person.id} value={person.id}>
                        {person.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError errors={[form.formState.errors.assignedDeliveryStaffId]} />
                </Field>
              ) : null}
              <Field data-invalid={Boolean(form.formState.errors.note)}>
                <FieldLabel htmlFor="delivery-note">
                  {nextStatus === 'Failed' ? 'Lý do thất bại' : 'Ghi chú'}
                </FieldLabel>
                <Textarea id="delivery-note" {...form.register('note')} />
                <FieldError errors={[form.formState.errors.note]} />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
