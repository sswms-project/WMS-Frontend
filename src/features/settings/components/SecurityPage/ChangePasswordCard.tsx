'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ConfirmPasswordHint } from '@/features/auth/components/RegisterPage/ConfirmPasswordHint'
import { PasswordRequirementList } from '@/features/auth/components/RegisterPage/PasswordRequirementList'
import {
  isCurrentPasswordIncorrectError,
  useChangePasswordMutation,
} from '@/features/auth/hooks/use-auth'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/schemas/change-password.schema'
import type { ApiErrorResponse } from '@/types/api'
import { SectionIconBadge } from './SectionIconBadge'

export function ChangePasswordCard() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const changePasswordMutation = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const newPasswordValue = useWatch({ control, name: 'newPassword' }) ?? ''
  const confirmPasswordValue = useWatch({ control, name: 'confirmPassword' }) ?? ''

  async function handleChangePassword(values: ChangePasswordFormValues) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Đổi mật khẩu thành công.')
      reset()
    } catch (error) {
      if (isCurrentPasswordIncorrectError(error as ApiErrorResponse)) {
        setError('currentPassword', { message: 'Mật khẩu hiện tại không đúng.' })
        return
      }
      toast.error(
        (error as ApiErrorResponse).message ?? 'Không thể đổi mật khẩu. Vui lòng thử lại.'
      )
    }
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2.5 border-b px-6 pt-5 pb-4">
        <SectionIconBadge icon={KeyRound} />
        <div>
          <CardTitle className="text-[14.5px] font-bold">Đổi mật khẩu</CardTitle>
          <CardDescription className="text-[12.5px]">
            Cần nhập đúng mật khẩu hiện tại để xác nhận thay đổi
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-6">
        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4.5">
          <Field data-invalid={Boolean(errors.currentPassword)}>
            <FieldLabel htmlFor="currentPassword">Mật khẩu hiện tại</FieldLabel>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                aria-invalid={Boolean(errors.currentPassword)}
                autoComplete="current-password"
                className="h-10 rounded-lg pr-10 text-sm"
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <FieldError>{errors.currentPassword?.message}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.newPassword)}>
            <FieldLabel htmlFor="newPassword">Mật khẩu mới</FieldLabel>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                aria-invalid={Boolean(errors.newPassword)}
                autoComplete="new-password"
                className="h-10 rounded-lg pr-10 text-sm"
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <FieldError>{errors.newPassword?.message}</FieldError>
          </Field>

          <Card size="sm" className="border-border bg-surface-container-low rounded-lg">
            <CardContent className="text-muted-foreground space-y-2.5 text-xs leading-5">
              <PasswordRequirementList password={newPasswordValue} />
            </CardContent>
          </Card>

          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu mới</FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                aria-invalid={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
                className="h-10 rounded-lg pr-10 text-sm"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <FieldError>{errors.confirmPassword?.message}</FieldError>
            <ConfirmPasswordHint
              password={newPasswordValue}
              confirmPassword={confirmPasswordValue}
            />
          </Field>

          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="h-[38px] w-fit rounded-lg px-5 text-[13px] font-semibold"
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              'Cập nhật mật khẩu'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
