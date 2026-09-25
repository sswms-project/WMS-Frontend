'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import type { SaveSupplierFormValues } from '../../schemas/supplier.schema'

interface SupplierFormFieldsProps {
  readonly idPrefix: string
  readonly form: UseFormReturn<SaveSupplierFormValues>
}

export function SupplierFormFields({ idPrefix, form }: SupplierFormFieldsProps) {
  const { errors } = form.formState

  return (
    <FieldGroup className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-2">
      <Field data-invalid={Boolean(errors.supplierCode)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-code`}>Mã nhà cung cấp *</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-code`}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(errors.supplierCode)}
          placeholder="Ví dụ: NCC000001…"
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
          placeholder="Ví dụ: Công ty TNHH Thiên Phúc…"
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
          placeholder="Ví dụ: 0901234567…"
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
          spellCheck={false}
          aria-invalid={Boolean(errors.email)}
          placeholder="Ví dụ: lienhe@thienphuc.vn…"
          {...form.register('email')}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={Boolean(errors.taxCode)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-tax-code`}>Mã số thuế</FieldLabel>
        <Input
          id={`${idPrefix}-supplier-tax-code`}
          autoComplete="off"
          aria-invalid={Boolean(errors.taxCode)}
          {...form.register('taxCode')}
        />
        <FieldError errors={[errors.taxCode]} />
      </Field>

      <Field className="md:col-span-2" data-invalid={Boolean(errors.address)}>
        <FieldLabel htmlFor={`${idPrefix}-supplier-address`}>Địa chỉ (tùy chọn)</FieldLabel>
        <Textarea
          id={`${idPrefix}-supplier-address`}
          rows={2}
          aria-invalid={Boolean(errors.address)}
          placeholder="Ví dụ: 12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM…"
          {...form.register('address')}
        />
        <FieldError errors={[errors.address]} />
      </Field>

      <div className="bg-muted/30 flex flex-col gap-3 rounded-lg border p-4 md:col-span-2">
        <h3 className="text-sm font-semibold">Thông tin liên hệ</h3>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.contactSalutation)}>
            <FieldLabel htmlFor={`${idPrefix}-contact-salutation`}>Xưng hô</FieldLabel>
            <NativeSelect
              id={`${idPrefix}-contact-salutation`}
              aria-invalid={Boolean(errors.contactSalutation)}
              {...form.register('contactSalutation')}
            >
              <NativeSelectOption value="">Chọn xưng hô</NativeSelectOption>
              <NativeSelectOption value="Ông">Ông</NativeSelectOption>
              <NativeSelectOption value="Bà">Bà</NativeSelectOption>
              <NativeSelectOption value="Anh">Anh</NativeSelectOption>
              <NativeSelectOption value="Chị">Chị</NativeSelectOption>
            </NativeSelect>
            <FieldError errors={[errors.contactSalutation]} />
          </Field>
          <Field data-invalid={Boolean(errors.contactName)}>
            <FieldLabel htmlFor={`${idPrefix}-contact-name`}>Họ và tên</FieldLabel>
            <Input
              id={`${idPrefix}-contact-name`}
              autoComplete="name"
              aria-invalid={Boolean(errors.contactName)}
              {...form.register('contactName')}
            />
            <FieldError errors={[errors.contactName]} />
          </Field>
          <Field data-invalid={Boolean(errors.contactEmail)}>
            <FieldLabel htmlFor={`${idPrefix}-contact-email`}>Email người liên hệ</FieldLabel>
            <Input
              id={`${idPrefix}-contact-email`}
              type="email"
              autoComplete="email"
              spellCheck={false}
              aria-invalid={Boolean(errors.contactEmail)}
              {...form.register('contactEmail')}
            />
            <FieldError errors={[errors.contactEmail]} />
          </Field>
          <Field data-invalid={Boolean(errors.contactMobile)}>
            <FieldLabel htmlFor={`${idPrefix}-contact-mobile`}>Số điện thoại di động</FieldLabel>
            <Input
              id={`${idPrefix}-contact-mobile`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.contactMobile)}
              {...form.register('contactMobile')}
            />
            <FieldError errors={[errors.contactMobile]} />
          </Field>
          <Field data-invalid={Boolean(errors.contactChannel)}>
            <FieldLabel htmlFor={`${idPrefix}-contact-channel`}>Kênh liên hệ</FieldLabel>
            <NativeSelect
              id={`${idPrefix}-contact-channel`}
              aria-invalid={Boolean(errors.contactChannel)}
              {...form.register('contactChannel')}
            >
              <NativeSelectOption value="">Chọn kênh liên hệ</NativeSelectOption>
              <NativeSelectOption value="Zalo">Zalo</NativeSelectOption>
              <NativeSelectOption value="Facebook">Facebook</NativeSelectOption>
              <NativeSelectOption value="Email">Email</NativeSelectOption>
              <NativeSelectOption value="Website">Website</NativeSelectOption>
              <NativeSelectOption value="Other">Khác</NativeSelectOption>
            </NativeSelect>
            <FieldError errors={[errors.contactChannel]} />
          </Field>
          <Field data-invalid={Boolean(errors.contactChannelName)}>
            <FieldLabel htmlFor={`${idPrefix}-contact-channel-name`}>Tên kênh</FieldLabel>
            <Input
              id={`${idPrefix}-contact-channel-name`}
              aria-invalid={Boolean(errors.contactChannelName)}
              placeholder="Ví dụ: @ten-tai-khoan…"
              {...form.register('contactChannelName')}
            />
            <FieldError errors={[errors.contactChannelName]} />
          </Field>
        </FieldGroup>
      </div>
    </FieldGroup>
  )
}
