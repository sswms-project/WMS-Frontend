import { LoaderCircle } from 'lucide-react'
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { StaffEmploymentPeriodFormValues } from '../../../schemas/staff-employment-period.schema'
import type { StaffEmploymentPeriod } from '../../../types/staff.types'
import { canEditEmploymentEndDate } from '../../../utils/staff-employment'

interface EmploymentPeriodDialogProps {
  readonly period: StaffEmploymentPeriod
  readonly form: UseFormReturn<StaffEmploymentPeriodFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: StaffEmploymentPeriodFormValues) => void
}

export function EmploymentPeriodDialog({
  period,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: EmploymentPeriodDialogProps) {
  const { errors } = form.formState
  const isEndDateEditable = canEditEmploymentEndDate(period)

  return (
    <Dialog open onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giai đoạn làm việc</DialogTitle>
          <DialogDescription>
            Ngày được ghi nhận tự động khi nhận lời mời và khi chấm dứt việc làm. Chỉ chỉnh sửa khi
            cần sửa sai sót.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.startDate)}>
              <FieldLabel htmlFor="employment-start-date">Ngày bắt đầu *</FieldLabel>
              <Input
                id="employment-start-date"
                type="date"
                aria-invalid={Boolean(errors.startDate)}
                {...form.register('startDate')}
              />
              <FieldError errors={[errors.startDate]} />
            </Field>
            <Field data-invalid={Boolean(errors.endDate)}>
              <FieldLabel htmlFor="employment-end-date">Ngày kết thúc</FieldLabel>
              <Input
                id="employment-end-date"
                type="date"
                disabled={!isEndDateEditable}
                aria-invalid={Boolean(errors.endDate)}
                {...form.register('endDate')}
              />
              {!isEndDateEditable && (
                <FieldDescription>
                  Giai đoạn đang làm việc chỉ kết thúc khi chấm dứt việc làm.
                </FieldDescription>
              )}
              <FieldError errors={[errors.endDate]} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
