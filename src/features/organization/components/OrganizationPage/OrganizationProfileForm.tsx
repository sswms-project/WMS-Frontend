'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save, X } from 'lucide-react'
import { useForm, type FieldErrors, type UseFormSetError } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  organizationFormSchema,
  type OrganizationFormValues,
} from '../../schemas/organization.schema'
import type { OrganizationResponse } from '../../types/organization.types'

export interface OrganizationFormSubmitContext {
  readonly dirtyFields: Partial<Record<keyof OrganizationFormValues, boolean>>
  readonly setError: UseFormSetError<OrganizationFormValues>
}

interface OrganizationProfileFormProps {
  readonly organization: OrganizationResponse
  readonly isPending: boolean
  readonly onCancel: () => void
  readonly onSubmit: (
    values: OrganizationFormValues,
    context: OrganizationFormSubmitContext
  ) => Promise<boolean>
}

function fieldError(
  errors: FieldErrors<OrganizationFormValues>,
  field: keyof OrganizationFormValues
) {
  return errors[field] ? [errors[field]] : undefined
}

export function OrganizationProfileForm({
  organization,
  isPending,
  onCancel,
  onSubmit,
}: OrganizationProfileFormProps) {
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      tenantName: organization.tenantName,
      phone: organization.phone,
      address: organization.address ?? '',
    },
  })

  async function handleSubmit(values: OrganizationFormValues) {
    await onSubmit(values, {
      dirtyFields: form.formState.dirtyFields,
      setError: form.setError,
    })
  }

  return (
    <section className="bg-card border" aria-labelledby="organization-edit-title">
      <div className="border-b px-4 py-4">
        <h2 id="organization-edit-title" className="text-base font-semibold">
          Chỉnh sửa hồ sơ tổ chức
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Email và trạng thái do hệ thống quản lý nên không thể chỉnh sửa tại đây.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FieldGroup className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.tenantName)}>
            <FieldLabel htmlFor="tenantName">Tên tổ chức</FieldLabel>
            <Input
              id="tenantName"
              autoFocus
              autoComplete="organization"
              aria-invalid={Boolean(form.formState.errors.tenantName)}
              {...form.register('tenantName')}
            />
            <FieldError errors={fieldError(form.formState.errors, 'tenantName')} />
          </Field>

          <Field data-invalid={Boolean(form.formState.errors.phone)}>
            <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(form.formState.errors.phone)}
              {...form.register('phone')}
            />
            <FieldError errors={fieldError(form.formState.errors, 'phone')} />
          </Field>

          <Field className="md:col-span-2" data-invalid={Boolean(form.formState.errors.address)}>
            <FieldLabel htmlFor="address">Địa chỉ</FieldLabel>
            <Textarea
              id="address"
              rows={4}
              autoComplete="street-address"
              aria-invalid={Boolean(form.formState.errors.address)}
              {...form.register('address')}
            />
            <FieldError errors={fieldError(form.formState.errors, 'address')} />
          </Field>
        </FieldGroup>

        <div className="flex flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
            <X className="size-4" aria-hidden="true" />
            Hủy
          </Button>
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </section>
  )
}
