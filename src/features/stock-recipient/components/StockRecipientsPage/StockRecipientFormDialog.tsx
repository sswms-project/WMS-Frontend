'use client'

import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { X } from 'lucide-react'
import { UnsavedChangesDialog } from '@/components/operations/UnsavedChangesDialog'
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { StockRecipientFormValues } from '../../schemas/stock-recipient.schema'

interface StockRecipientFormDialogProps {
  readonly open: boolean
  readonly title: string
  readonly description: string
  readonly form: UseFormReturn<StockRecipientFormValues>
  readonly isPending: boolean
  readonly isCreate?: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: StockRecipientFormValues) => void
  readonly onSubmitAndAdd?: (values: StockRecipientFormValues) => void
}

export function StockRecipientFormDialog({
  open,
  title,
  description,
  form,
  isPending,
  isCreate = false,
  onOpenChange,
  onSubmit,
  onSubmitAndAdd,
}: StockRecipientFormDialogProps) {
  const { errors, isDirty } = form.formState
  const recipientType = form.watch('recipientType')
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  function requestClose() {
    if (isPending) return
    if (isDirty) {
      setDiscardDialogOpen(true)
      return
    }
    onOpenChange(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true)
      return
    }
    requestClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[calc(100dvh-1rem)] min-h-0 w-[min(100%-1rem,64rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-2rem)] sm:w-[min(100%-2rem,64rem)]"
        >
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
                <DialogDescription className="mt-1">{description}</DialogDescription>
              </div>
              <Controller
                control={form.control}
                name="recipientType"
                render={({ field }) => (
                  <RadioGroup
                    aria-label="Loại khách hàng"
                    className="mt-2 flex w-auto shrink-0 flex-row gap-5 sm:mt-0"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Field className="flex-row items-center gap-2">
                      <RadioGroupItem id="stockRecipient-organization" value="Organization" />
                      <FieldLabel htmlFor="stockRecipient-organization" className="font-normal">
                        Tổ chức
                      </FieldLabel>
                    </Field>
                    <Field className="flex-row items-center gap-2">
                      <RadioGroupItem id="stockRecipient-individual" value="Individual" />
                      <FieldLabel htmlFor="stockRecipient-individual" className="font-normal">
                        Cá nhân
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3"
                aria-label="Đóng biểu mẫu"
                onClick={requestClose}
              >
                <X aria-hidden="true" />
              </Button>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <FieldGroup className="gap-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  {recipientType === 'Individual' ? (
                    <Field data-invalid={Boolean(errors.contactSalutation)}>
                      <FieldLabel htmlFor="stockRecipient-salutation">Xưng hô</FieldLabel>
                      <NativeSelect
                        id="stockRecipient-salutation"
                        name="contactSalutation"
                        value={form.watch('contactSalutation')}
                        onChange={(event) =>
                          form.setValue('contactSalutation', event.target.value, {
                            shouldDirty: true,
                          })
                        }
                        aria-invalid={Boolean(errors.contactSalutation)}
                      >
                        <NativeSelectOption value="">Chọn xưng hô</NativeSelectOption>
                        <NativeSelectOption value="Ông">Ông</NativeSelectOption>
                        <NativeSelectOption value="Bà">Bà</NativeSelectOption>
                        <NativeSelectOption value="Anh">Anh</NativeSelectOption>
                        <NativeSelectOption value="Chị">Chị</NativeSelectOption>
                      </NativeSelect>
                      <FieldError errors={[errors.contactSalutation]} />
                    </Field>
                  ) : null}
                  <Field
                    className={recipientType === 'Organization' ? 'lg:col-span-2' : ''}
                    data-invalid={Boolean(errors.recipientName)}
                  >
                    <FieldLabel htmlFor="stockRecipient-name">Tên khách hàng *</FieldLabel>
                    <Input
                      id="stockRecipient-name"
                      autoComplete={recipientType === 'Organization' ? 'organization' : 'name'}
                      aria-invalid={Boolean(errors.recipientName)}
                      {...form.register('recipientName')}
                    />
                    <FieldError errors={[errors.recipientName]} />
                  </Field>
                  {recipientType === 'Organization' ? (
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
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field className="md:col-span-2" data-invalid={Boolean(errors.address)}>
                    <FieldLabel htmlFor="stockRecipient-address">Địa chỉ</FieldLabel>
                    <Textarea
                      id="stockRecipient-address"
                      autoComplete="street-address"
                      rows={2}
                      aria-invalid={Boolean(errors.address)}
                      {...form.register('address')}
                    />
                    <FieldError errors={[errors.address]} />
                  </Field>
                  <Field className="md:col-span-2" data-invalid={Boolean(errors.shippingAddress)}>
                    <FieldLabel htmlFor="stockRecipient-shippingAddress">
                      Địa chỉ giao hàng
                    </FieldLabel>
                    <Textarea
                      id="stockRecipient-shippingAddress"
                      rows={2}
                      aria-invalid={Boolean(errors.shippingAddress)}
                      {...form.register('shippingAddress')}
                    />
                    <FieldError errors={[errors.shippingAddress]} />
                  </Field>
                </div>

                <section
                  aria-labelledby="stockRecipient-contact-heading"
                  className="bg-muted/30 rounded-md border p-4"
                >
                  <h2 id="stockRecipient-contact-heading" className="mb-3 text-sm font-semibold">
                    Thông tin liên hệ
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {recipientType === 'Organization' ? (
                      <>
                        <Field data-invalid={Boolean(errors.contactSalutation)}>
                          <FieldLabel htmlFor="stockRecipient-contactSalutation">
                            Xưng hô
                          </FieldLabel>
                          <NativeSelect
                            id="stockRecipient-contactSalutation"
                            name="contactSalutation"
                            value={form.watch('contactSalutation')}
                            onChange={(event) =>
                              form.setValue('contactSalutation', event.target.value, {
                                shouldDirty: true,
                              })
                            }
                            aria-invalid={Boolean(errors.contactSalutation)}
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
                          <FieldLabel htmlFor="stockRecipient-contactName">Họ và tên</FieldLabel>
                          <Input
                            id="stockRecipient-contactName"
                            autoComplete="name"
                            aria-invalid={Boolean(errors.contactName)}
                            {...form.register('contactName')}
                          />
                          <FieldError errors={[errors.contactName]} />
                        </Field>
                        <Field data-invalid={Boolean(errors.email)}>
                          <FieldLabel htmlFor="stockRecipient-email">
                            Email người liên hệ
                          </FieldLabel>
                          <Input
                            id="stockRecipient-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            spellCheck={false}
                            aria-invalid={Boolean(errors.email)}
                            {...form.register('email')}
                          />
                          <FieldError errors={[errors.email]} />
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field data-invalid={Boolean(errors.email)}>
                          <FieldLabel htmlFor="stockRecipient-email">Email</FieldLabel>
                          <Input
                            id="stockRecipient-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            spellCheck={false}
                            aria-invalid={Boolean(errors.email)}
                            {...form.register('email')}
                          />
                          <FieldError errors={[errors.email]} />
                        </Field>
                        <Field data-invalid={Boolean(errors.phone)}>
                          <FieldLabel htmlFor="stockRecipient-phone">Điện thoại cố định</FieldLabel>
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
                      </>
                    )}
                    <Field data-invalid={Boolean(errors.contactMobile)}>
                      <FieldLabel htmlFor="stockRecipient-contactMobile">
                        Số điện thoại di động
                      </FieldLabel>
                      <Input
                        id="stockRecipient-contactMobile"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.contactMobile)}
                        {...form.register('contactMobile')}
                      />
                      <FieldError errors={[errors.contactMobile]} />
                    </Field>
                    <Field data-invalid={Boolean(errors.contactChannel)}>
                      <FieldLabel htmlFor="stockRecipient-contactChannel">Kênh liên hệ</FieldLabel>
                      <NativeSelect
                        id="stockRecipient-contactChannel"
                        aria-invalid={Boolean(errors.contactChannel)}
                        {...form.register('contactChannel')}
                      >
                        <NativeSelectOption value="">Chọn kênh</NativeSelectOption>
                        <NativeSelectOption value="Email">Email</NativeSelectOption>
                        <NativeSelectOption value="Zalo">Zalo</NativeSelectOption>
                        <NativeSelectOption value="Facebook">Facebook</NativeSelectOption>
                        <NativeSelectOption value="Website">Website</NativeSelectOption>
                        <NativeSelectOption value="Khác">Khác</NativeSelectOption>
                      </NativeSelect>
                      <FieldError errors={[errors.contactChannel]} />
                    </Field>
                    <Field data-invalid={Boolean(errors.contactChannelName)}>
                      <FieldLabel htmlFor="stockRecipient-contactChannelName">Tên kênh</FieldLabel>
                      <Input
                        id="stockRecipient-contactChannelName"
                        placeholder="Ví dụ: kovia.support…"
                        aria-invalid={Boolean(errors.contactChannelName)}
                        {...form.register('contactChannelName')}
                      />
                      <FieldError errors={[errors.contactChannelName]} />
                    </Field>
                  </div>
                </section>
              </FieldGroup>
            </div>

            <DialogFooter className="bg-background shrink-0 border-t px-5 py-3 sm:px-6">
              <Button type="button" variant="outline" onClick={requestClose}>
                Hủy
              </Button>
              {isCreate && onSubmitAndAdd ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => void form.handleSubmit(onSubmitAndAdd)()}
                >
                  {isPending ? <Spinner data-icon="inline-start" /> : null}
                  Lưu và thêm
                </Button>
              ) : null}
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                {isCreate ? 'Lưu khách hàng' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <UnsavedChangesDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        onDiscard={() => {
          setDiscardDialogOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
