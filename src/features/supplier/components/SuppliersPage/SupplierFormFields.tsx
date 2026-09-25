'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SaveSupplierFormValues } from '../../schemas/supplier.schema'

interface SupplierFormFieldsProps {
  readonly idPrefix: string
  readonly form: UseFormReturn<SaveSupplierFormValues>
}

export function SupplierFormFields({ idPrefix, form }: SupplierFormFieldsProps) {
  const { errors } = form.formState

  return (
    <FieldGroup className="grid gap-4 sm:grid-cols-2">
      <Field data-invalid={Boolean(errors.supplierCode)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-code`}>Mã nhà cung cấp *</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-code`}
          autoComplete="off"
          aria-invalid={Boolean(errors.supplierCode)}
          placeholder="VD: NCC0001"
          {...form.register('supplierCode')}
        />
        <FieldError errors={[errors.supplierCode]} />
      </Field>

      <Field data-invalid={Boolean(errors.supplierName)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-name`}>Tên nhà cung cấp *</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-name`}
          autoComplete="organization"
          aria-invalid={Boolean(errors.supplierName)}
          placeholder="VD: Công ty TNHH Thiên Phúc"
          {...form.register('supplierName')}
        />
        <FieldError errors={[errors.supplierName]} />
      </Field>

      <Field data-invalid={Boolean(errors.phone)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-phone`}>Số điện thoại</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-phone`}
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={Boolean(errors.phone)}
          placeholder="VD: 0901234567"
          {...form.register('phone')}
        />
        <FieldError errors={[errors.phone]} />
      </Field>

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-email`}>Email (tùy chọn)</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-email`}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          placeholder="VD: lienhe@thienphuc.vn"
          {...form.register('email')}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field className="sm:col-span-2" data-invalid={Boolean(errors.address)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-address`}>Địa chỉ (tùy chọn)</FieldLabel>
        <Textarea
          id={`${idPrefix}-supplier-address`}
          rows={2}
          aria-invalid={Boolean(errors.address)}
          placeholder="VD: 12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM"
          {...form.register('address')}
        />
        <FieldError errors={[errors.address]} />
      </Field>
    </FieldGroup>
  )
}
