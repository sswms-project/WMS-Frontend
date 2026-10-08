'use client'

import { CalendarClock, LoaderCircle } from 'lucide-react'
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
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import type { WarehouseTaskScheduleFormValues } from '../../schemas/warehouse-task-schedule.schema'
import type { MyWarehouseTask } from '../../types/warehouse-task.types'

interface WarehouseTaskScheduleDialogProps {
  readonly task: MyWarehouseTask | null
  readonly form: UseFormReturn<WarehouseTaskScheduleFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: () => void
}

export function WarehouseTaskScheduleDialog({
  task,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: WarehouseTaskScheduleDialogProps) {
  const errors = form.formState.errors
  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        {task ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarClock className="text-primary size-5" aria-hidden="true" />
                Điều chỉnh lịch công việc
              </DialogTitle>
              <DialogDescription>
                <span className="font-mono font-medium">{task.referenceCode}</span> ·{' '}
                {task.warehouseName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.priority)}>
                <FieldLabel htmlFor="task-schedule-priority">Mức ưu tiên</FieldLabel>
                <NativeSelect id="task-schedule-priority" {...form.register('priority')}>
                  <NativeSelectOption value="Normal">Bình thường</NativeSelectOption>
                  <NativeSelectOption value="Urgent">Khẩn</NativeSelectOption>
                </NativeSelect>
                <FieldError>{errors.priority?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.dueAt)}>
                <FieldLabel htmlFor="task-schedule-due-at">Hạn hoàn thành</FieldLabel>
                <Input
                  id="task-schedule-due-at"
                  type="datetime-local"
                  {...form.register('dueAt')}
                />
                <FieldError>{errors.dueAt?.message}</FieldError>
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.reason)}>
              <FieldLabel htmlFor="task-schedule-reason">Lý do thay đổi</FieldLabel>
              <Textarea
                id="task-schedule-reason"
                rows={3}
                maxLength={500}
                placeholder="Ví dụ: thay đổi ca làm, hàng đến trễ, cân bằng khối lượng…"
                {...form.register('reason')}
              />
              <FieldDescription>
                Lý do được lưu vào nhật ký và gửi cho nhân viên đang phụ trách.
              </FieldDescription>
              <FieldError>{errors.reason?.message}</FieldError>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button type="button" disabled={isPending} onClick={onSubmit}>
                {isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <CalendarClock aria-hidden="true" />
                )}
                Lưu lịch
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
