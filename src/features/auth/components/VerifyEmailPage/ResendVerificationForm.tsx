'use client'

import { Loader2, Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { ResendVerificationFormValues } from '../../schemas/resend-verification.schema'

interface ResendVerificationFormProps {
  readonly form: UseFormReturn<ResendVerificationFormValues>
  readonly isPending: boolean
  readonly onSubmit: (values: ResendVerificationFormValues) => Promise<void>
}

export function ResendVerificationForm({ form, isPending, onSubmit }: ResendVerificationFormProps) {
  return (
    <form className="mt-5 flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
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
