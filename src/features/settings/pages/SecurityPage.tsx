'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  isCurrentPasswordIncorrectError,
  useChangePasswordMutation,
  useMeQuery,
} from '@/features/auth/hooks/use-auth'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/schemas/change-password.schema'
import { isApiErrorResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { useTwoFactorDisableMutation } from '../hooks/use-two-factor'
import { twoFactorOtpSchema, type TwoFactorOtpFormValues } from '../schemas/two-factor.schema'
import { ChangePasswordCard, SecurityOverviewCard, TwoFactorCard } from '../components/SecurityPage'

export function SecurityPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const changePasswordMutation = useChangePasswordMutation()
  const disableTwoFactorMutation = useTwoFactorDisableMutation()
  const meQuery = useMeQuery()
  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const disableTwoFactorForm = useForm<TwoFactorOtpFormValues>({
    resolver: zodResolver(twoFactorOtpSchema),
    defaultValues: { otp: '' },
  })

  useEffect(() => {
    if (!meQuery.error) return
    logger.error(meQuery.error)
    toast.error(meQuery.error.message ?? 'Không thể tải thông tin tài khoản. Vui lòng thử lại.')
  }, [meQuery.error])

  function endCurrentSession() {
    clearAuth()
    queryClient.clear()
    router.replace(APP_ROUTES.auth.login)
  }

  async function handleChangePassword(values: ChangePasswordFormValues) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
      endCurrentSession()
    } catch (error) {
      if (isApiErrorResponse(error) && isCurrentPasswordIncorrectError(error)) {
        changePasswordForm.setError('currentPassword', {
          message: 'Mật khẩu hiện tại không đúng.',
        })
        return
      }
      toast.error(
        isApiErrorResponse(error) ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.'
      )
    }
  }

  async function handleDisableTwoFactor(values: TwoFactorOtpFormValues) {
    try {
      await disableTwoFactorMutation.mutateAsync(values)
      endCurrentSession()
    } catch {
      // The mutation shows the user-facing error.
    }
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
      <SecurityOverviewCard />
      <div className="flex min-w-0 flex-col gap-6">
        <ChangePasswordCard
          form={changePasswordForm}
          isPending={changePasswordMutation.isPending}
          onSubmit={handleChangePassword}
        />
        <TwoFactorCard
          isLoading={meQuery.isLoading}
          isError={meQuery.isError}
          isTwoFactorEnabled={meQuery.data?.isTwoFactorEnabled ?? false}
          disableForm={disableTwoFactorForm}
          isDisabling={disableTwoFactorMutation.isPending}
          onDisable={handleDisableTwoFactor}
        />
      </div>
    </div>
  )
}
