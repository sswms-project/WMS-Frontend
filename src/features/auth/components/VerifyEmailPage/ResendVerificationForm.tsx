'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const resendVerificationSchema = z.object({
  email: z.string().trim().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
})

type ResendVerificationValues = z.infer<typeof resendVerificationSchema>

interface ResendVerificationFormProps {
  readonly isPending: boolean
  readonly onSubmit: (email: string) => Promise<void>
}

export function ResendVerificationForm({ isPending, onSubmit }: ResendVerificationFormProps) {
  const form = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: '' },
  })

  return (
    <form
      className="mt-5 flex flex-col gap-3"
      onSubmit={form.handleSubmit((values) => onSubmit(values.email))}
    >
      <Field data-invalid={Boolean(form.formState.errors.email)}>
        <FieldLabel htmlFor="resend-email">Email đã đăng ký</FieldLabel>
        <Input
          id="resend-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register('email')}
        />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </Field>
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? (
          <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
        {isPending ? 'Đang gửi…' : 'Gửi lại email xác minh'}
      </Button>
    </form>
  )
}
