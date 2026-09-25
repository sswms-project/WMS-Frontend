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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { StockRecipientFormValues } from '../../schemas/stock-recipient.schema'

interface StockRecipientFormDialogProps {
  readonly open: boolean
  readonly title: string
  readonly description: string
  readonly form: UseFormReturn<StockRecipientFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: StockRecipientFormValues) => void
}

export function StockRecipientFormDialog({
  open,
  title,
  description,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: StockRecipientFormDialogProps) {
  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errors.recipientCode)}>
              <FieldLabel htmlFor="stockRecipient-code">Mã khách hàng *</FieldLabel>
              <Input
                id="stockRecipient-code"
                autoComplete="off"
                spellCheck={false}
                placeholder="Ví dụ: KH000001…"
                aria-invalid={Boolean(errors.recipientCode)}
                {...form.register('recipientCode')}
              />
              <FieldError errors={[errors.recipientCode]} />
            </Field>
            <Field data-invalid={Boolean(errors.recipientName)}>
              <FieldLabel htmlFor="stockRecipient-name">Tên khách hàng *</FieldLabel>
              <Input
                id="stockRecipient-name"
                aria-invalid={Boolean(errors.recipientName)}
                {...form.register('recipientName')}
              />
              <FieldError errors={[errors.recipientName]} />
            </Field>
            <Field data-invalid={Boolean(errors.taxCode)}>
              <FieldLabel htmlFor="stockRecipient-taxCode">Mã số thuế</FieldLabel>
              <Input
                id="stockRecipient-taxCode"
                autoComplete="off"
                aria-invalid={Boolean(errors.taxCode)}
                {...form.register('taxCode')}
              />
              <FieldError errors={[errors.taxCode]} />
            </Field>
            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="stockRecipient-phone">Số điện thoại</FieldLabel>
              <Input
                id="stockRecipient-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                {...form.register('phone')}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="stockRecipient-email">Email</FieldLabel>
              <Input
                id="stockRecipient-email"
                type="email"
                spellCheck={false}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...form.register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field className="md:col-span-2" data-invalid={Boolean(errors.address)}>
              <FieldLabel htmlFor="stockRecipient-address">Địa chỉ</FieldLabel>
              <Textarea
                rows={2}
                id="stockRecipient-address"
                aria-invalid={Boolean(errors.address)}
                {...form.register('address')}
              />
              <FieldError errors={[errors.address]} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Lưu khách hàng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
