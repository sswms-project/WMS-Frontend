'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useSwitchTenantMutation } from '@/features/auth/hooks/use-auth'
import { decodeJwtUser } from '@/features/auth/utils/decode-jwt-user'
import { getApiErrorMessage } from '@/lib/api-error'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { AcceptInvitationForm } from '../components/AcceptInvitationPage'
import {
  useAcceptExistingInvitationMutation,
  useAcceptInvitationMutation,
  useInvitationPreviewQuery,
} from '../hooks/use-invitations'
import type { AcceptInvitationFormValues } from '../schemas/invitation.schema'

interface AcceptInvitationPageProps {
  readonly token?: string
}

export function AcceptInvitationPage({ token }: AcceptInvitationPageProps) {
  const acceptMutation = useAcceptInvitationMutation()
  const acceptExistingMutation = useAcceptExistingInvitationMutation()
  const switchTenantMutation = useSwitchTenantMutation()
  const previewQuery = useInvitationPreviewQuery(token ?? '')
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isSuccess, setIsSuccess] = useState(false)
  const [actionErrorMessage, setActionErrorMessage] = useState<string>()

  async function acceptInvitation(values: AcceptInvitationFormValues) {
    if (!token || acceptMutation.isPending) return

    setActionErrorMessage(undefined)
    try {
      await acceptMutation.mutateAsync({
        token,
        request: {
          fullName: values.fullName?.trim() || undefined,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
      })
      setIsSuccess(true)
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(error, 'Không thể kích hoạt tài khoản. Vui lòng thử lại.')
      )
    }
  }

  async function acceptExistingInvitation() {
    if (!token || acceptExistingMutation.isPending || switchTenantMutation.isPending) return
    setActionErrorMessage(undefined)
    try {
      const accepted = await acceptExistingMutation.mutateAsync(token)
      const switched = await switchTenantMutation.mutateAsync({ tenantId: accepted.data })
      const accessToken = switched.data.accessToken?.trim()
      const refreshToken = switched.data.refreshToken?.trim()
      if (!accessToken || !refreshToken)
        throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ.')
      setAuth(decodeJwtUser(accessToken), accessToken, refreshToken)
      queryClient.clear()
      setIsSuccess(true)
      router.replace(APP_ROUTES.dashboard)
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(
          error,
          'Không thể chấp nhận lời mời hoặc chuyển tổ chức. Vui lòng thử lại.'
        )
      )
    }
  }

  return (
    <AcceptInvitationForm
      token={token}
      preview={previewQuery.data}
      isPreviewLoading={previewQuery.isLoading}
      isAuthenticated={Boolean(user)}
      authenticatedEmail={user?.email}
      isLoading={
        acceptMutation.isPending ||
        acceptExistingMutation.isPending ||
        switchTenantMutation.isPending
      }
      isSuccess={isSuccess}
      errorMessage={previewQuery.error?.message}
      actionErrorMessage={actionErrorMessage}
      onSubmit={acceptInvitation}
      onAcceptExisting={acceptExistingInvitation}
    />
  )
}
