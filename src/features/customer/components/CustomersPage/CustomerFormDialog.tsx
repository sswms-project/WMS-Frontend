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
import type { CustomerFormValues } from '../../schemas/customer.schema'

interface CustomerFormDialogProps {
  readonly open: boolean
  readonly title: string
  readonly description: string
  readonly form: UseFormReturn<CustomerFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CustomerFormValues) => void
}

export function CustomerFormDialog({
  open,
  title,
  description,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: CustomerFormDialogProps) {
  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.customerName)}>
              <FieldLabel htmlFor="customer-name">Tên khách hàng</FieldLabel>
              <Input
                id="customer-name"
                aria-invalid={Boolean(errors.customerName)}
                {...form.register('customerName')}
              />
              <FieldError errors={[errors.customerName]} />
            </Field>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.phone)}>
                <FieldLabel htmlFor="customer-phone">Số điện thoại</FieldLabel>
                <Input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.phone)}
                  {...form.register('phone')}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="customer-email">Email</FieldLabel>
                <Input
                  id="customer-email"
                  type="email"
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.email)}
                  {...form.register('email')}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </FieldGroup>
            <Field data-invalid={Boolean(errors.address)}>
              <FieldLabel htmlFor="customer-address">Địa chỉ</FieldLabel>
              <Textarea
                id="customer-address"
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
