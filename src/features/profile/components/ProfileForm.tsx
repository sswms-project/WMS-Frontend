'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save, UserPen, X } from 'lucide-react'
import { useForm, type FieldErrors, type UseFormSetError } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { UserProfileResponse } from '@/features/auth/types/auth.types'
import { SectionIconBadge } from '@/features/settings/components/SecurityPage'
import { profileFormSchema, type ProfileFormValues } from '../schemas/profile.schema'

export interface ProfileFormSubmitContext {
  readonly dirtyFields: Partial<Record<keyof ProfileFormValues, boolean>>
  readonly setError: UseFormSetError<ProfileFormValues>
}

interface ProfileFormProps {
  readonly profile: UserProfileResponse
  readonly isPending: boolean
  readonly onCancel: () => void
  readonly onSubmit: (
    values: ProfileFormValues,
    context: ProfileFormSubmitContext
  ) => Promise<boolean>
}

function fieldError(errors: FieldErrors<ProfileFormValues>, field: keyof ProfileFormValues) {
  return errors[field] ? [errors[field]] : undefined
}

export function ProfileForm({ profile, isPending, onCancel, onSubmit }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone ?? '',
    },
  })

  async function handleSubmit(values: ProfileFormValues) {
    await onSubmit(values, {
      dirtyFields: form.formState.dirtyFields,
      setError: form.setError,
    })
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-3 gap-0 py-0 duration-300">
      <CardHeader className="flex flex-row items-center gap-2.5 border-b px-6 pt-5 pb-4">
        <SectionIconBadge icon={UserPen} tone="primary" />
        <div>
          <CardTitle className="text-[14.5px] font-bold">Chỉnh sửa hồ sơ</CardTitle>
          <CardDescription className="text-[12.5px]">
            Vai trò và trạng thái do hệ thống quản lý, không thể chỉnh sửa tại đây
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <CardContent className="px-6 py-6">
          <FieldGroup className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
            <Field
              data-invalid={Boolean(form.formState.errors.fullName)}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-75 duration-300"
            >
              <FieldLabel htmlFor="fullName">Họ và tên</FieldLabel>
              <Input
                id="fullName"
                autoFocus
                autoComplete="name"
                placeholder="Nhập họ và tên"
                className="h-10 rounded-lg text-sm transition-shadow focus:shadow-sm"
                aria-invalid={Boolean(form.formState.errors.fullName)}
                {...form.register('fullName')}
              />
              <FieldError errors={fieldError(form.formState.errors, 'fullName')} />
            </Field>

            <Field
              data-invalid={Boolean(form.formState.errors.phone)}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-100 duration-300"
            >
              <FieldLabel htmlFor="phone">
                Số điện thoại
                <span className="text-muted-foreground ml-1 text-xs font-normal">(tùy chọn)</span>
              </FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Vd: 0901 234 567"
                className="h-10 rounded-lg text-sm transition-shadow focus:shadow-sm"
                aria-invalid={Boolean(form.formState.errors.phone)}
                {...form.register('phone')}
              />
              <FieldError errors={fieldError(form.formState.errors, 'phone')} />
            </Field>

            <Field
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-150 duration-300 md:col-span-2"
              data-invalid={Boolean(form.formState.errors.email)}
            >
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ email"
                className="h-10 rounded-lg text-sm transition-shadow focus:shadow-sm"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register('email')}
              />
              <FieldError errors={fieldError(form.formState.errors, 'email')} />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="h-[38px] rounded-lg px-4 text-[13px]"
            disabled={isPending}
            onClick={onCancel}
          >
            <X className="size-4" aria-hidden="true" />
            Hủy
          </Button>
          <Button
            type="submit"
            className="h-[38px] rounded-lg px-5 text-[13px] font-semibold"
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Lưu thay đổi
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
