'use client'

import { Loader2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { TenantRegistrationRejectionFormValues } from '../../schemas/tenant-registration-rejection.schema'

interface TenantRegistrationDialogProps {
  readonly open: boolean
  readonly tenantName: string
  readonly action: 'approve' | 'reject'
  readonly form: UseFormReturn<TenantRegistrationRejectionFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onApprove: () => Promise<void>
  readonly onReject: (values: TenantRegistrationRejectionFormValues) => Promise<void>
}

export function TenantRegistrationDialog({
  open,
  tenantName,
  action,
  form,
  isPending,
  onOpenChange,
  onApprove,
  onReject,
}: TenantRegistrationDialogProps) {
  const isApprove = action === 'approve'

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return
    if (!nextOpen) form.reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="animation-duration-250"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isApprove ? 'Phê duyệt' : 'Từ chối'} đăng ký {tenantName}?
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? 'Tenant và tài khoản chủ sở hữu sẽ được kích hoạt sau khi xác nhận.'
              : 'Tenant và tài khoản chủ sở hữu sẽ chuyển sang không hoạt động. Lý do sẽ được gửi qua email.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={
            isApprove
              ? (event) => {
                  event.preventDefault()
                  void onApprove()
                }
              : form.handleSubmit(onReject)
          }
        >
          {!isApprove ? (
            <Field data-invalid={Boolean(form.formState.errors.reason)}>
              <FieldLabel htmlFor="registration-decision-reason">Lý do từ chối</FieldLabel>
              <Textarea
                id="registration-decision-reason"
                rows={4}
                maxLength={500}
                autoComplete="off"
                aria-invalid={Boolean(form.formState.errors.reason)}
                placeholder="Ví dụ: Nêu rõ thông tin cần bổ sung…"
                {...form.register('reason')}
              />
              <FieldError errors={[form.formState.errors.reason]} />
            </Field>
          ) : null}
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant={isApprove ? 'default' : 'destructive'}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Đang xử lý…
                </>
              ) : isApprove ? (
                'Xác nhận phê duyệt'
              ) : (
                'Xác nhận từ chối'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
