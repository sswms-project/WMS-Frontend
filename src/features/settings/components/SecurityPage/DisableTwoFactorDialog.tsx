'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { TwoFactorOtpFormValues } from '../../schemas/two-factor.schema'

interface DisableTwoFactorDialogProps {
  readonly form: UseFormReturn<TwoFactorOtpFormValues>
  readonly isPending: boolean
  readonly onSubmit: (values: TwoFactorOtpFormValues) => Promise<void>
}

export function DisableTwoFactorDialog({ form, isPending, onSubmit }: DisableTwoFactorDialogProps) {
  const [open, setOpen] = useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return
    if (!nextOpen) form.reset()
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 h-9 rounded-lg px-4.5 text-[13px] font-semibold"
        >
          Tắt xác thực hai yếu tố
        </Button>
      </DialogTrigger>
      <DialogContent
        className="animation-duration-250"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Tắt xác thực hai yếu tố?</DialogTitle>
          <DialogDescription>
            Nhập mã hiện tại từ ứng dụng xác thực. Sau khi tắt, phiên đăng nhập này sẽ kết thúc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Field data-invalid={Boolean(form.formState.errors.otp)}>
            <FieldLabel htmlFor="disable-2fa-otp">Mã OTP hiện tại</FieldLabel>
            <Input
              id="disable-2fa-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-invalid={Boolean(form.formState.errors.otp)}
              {...form.register('otp')}
            />
            <FieldError>{form.formState.errors.otp?.message}</FieldError>
          </Field>
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : null}
              {isPending ? 'Đang tắt…' : 'Tắt và đăng xuất'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
