'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { CancelPutawayTaskFormValues } from '../../schemas/inbound.schema'

interface CancelPutawayDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly form: UseFormReturn<CancelPutawayTaskFormValues>
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: () => void
  readonly mode?: 'cancel' | 'reconcile'
}

export function CancelPutawayDialog({
  open,
  isPending,
  form,
  onOpenChange,
  onSubmit,
  mode = 'cancel',
}: CancelPutawayDialogProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'reconcile' ? 'Hoàn tất đối soát hủy' : 'Hủy phần cất hàng còn lại'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'reconcile'
              ? 'Xác nhận hàng đã di chuyển vật lý đã được đối soát đúng với sổ kho trước khi đóng nhiệm vụ.'
              : 'Phần đã cất vẫn được giữ nguyên. Hệ thống sẽ dừng toàn bộ số lượng chưa thực hiện và ghi lý do vào lịch sử nghiệp vụ.'}
          </DialogDescription>
        </DialogHeader>
        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="cancel-putaway-reason">
            {mode === 'reconcile' ? 'Kết quả đối soát' : 'Lý do hủy'}
          </FieldLabel>
          <Textarea
            id="cancel-putaway-reason"
            rows={4}
            maxLength={500}
            aria-invalid={Boolean(errors.reason)}
            {...register('reason')}
          />
          <FieldError>{errors.reason?.message}</FieldError>
        </Field>
        {mode === 'cancel' ? (
          <label className="flex items-start gap-3 border p-3 text-sm">
            <Checkbox
              checked={form.watch('hasUnrecordedPhysicalMovement')}
              onCheckedChange={(checked) =>
                form.setValue('hasUnrecordedPhysicalMovement', checked === true)
              }
            />
            <span>
              <strong>Có hàng đã di chuyển vật lý nhưng chưa ghi nhận</strong>
              <span className="text-muted-foreground block text-xs">
                Nhiệm vụ sẽ chuyển sang chờ đối soát thay vì đóng ngay.
              </span>
            </span>
          </label>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Quay lại
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onSubmit}>
            {isPending
              ? 'Đang lưu...'
              : mode === 'reconcile'
                ? 'Xác nhận đã đối soát'
                : 'Xác nhận hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
