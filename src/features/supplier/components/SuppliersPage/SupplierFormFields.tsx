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
    <FieldGroup>
      <Field data-invalid={Boolean(errors.supplierName)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-name`}>Tên nhà cung cấp</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-name`}
          autoComplete="off"
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
          autoComplete="off"
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
          autoComplete="off"
          aria-invalid={Boolean(errors.email)}
          placeholder="VD: lienhe@thienphuc.vn"
          {...form.register('email')}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={Boolean(errors.address)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-address`}>Địa chỉ (tùy chọn)</FieldLabel>
        <Textarea
          id={`${idPrefix}-supplier-address`}
          rows={3}
          aria-invalid={Boolean(errors.address)}
          placeholder="VD: 12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM"
          {...form.register('address')}
        />
        <FieldError errors={[errors.address]} />
      </Field>
    </FieldGroup>
  )
}
