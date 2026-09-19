'use client'

import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { useTwoFactorDisableMutation } from '../../hooks/use-two-factor'
import { twoFactorOtpSchema, type TwoFactorOtpFormValues } from '../../schemas/two-factor.schema'

export function DisableTwoFactorDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const disableMutation = useTwoFactorDisableMutation()
  const form = useForm<TwoFactorOtpFormValues>({
    resolver: zodResolver(twoFactorOtpSchema),
    defaultValues: { otp: '' },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && disableMutation.isPending) return
    if (!nextOpen) form.reset()
    setOpen(nextOpen)
  }

  async function handleDisable(values: TwoFactorOtpFormValues) {
    try {
      await disableMutation.mutateAsync(values)
      clearAuth()
      queryClient.clear()
      router.replace(APP_ROUTES.auth.login)
    } catch {
      // The mutation shows the user-facing error.
    }
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
          if (disableMutation.isPending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Tắt xác thực hai yếu tố?</DialogTitle>
          <DialogDescription>
            Nhập mã hiện tại từ ứng dụng xác thực. Sau khi tắt, phiên đăng nhập này sẽ kết thúc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleDisable)}>
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
              <Button type="button" variant="outline" disabled={disableMutation.isPending}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={disableMutation.isPending}>
              {disableMutation.isPending ? (
                <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : null}
              {disableMutation.isPending ? 'Đang tắt…' : 'Tắt và đăng xuất'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
