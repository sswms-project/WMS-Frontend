'use client'

import { useState } from 'react'
import { getApiErrorMessage } from '@/lib/api-error'
import { AcceptInvitationForm } from '../components/AcceptInvitationPage'
import { useAcceptInvitationMutation, useInvitationPreviewQuery } from '../hooks/use-invitations'
import type { AcceptInvitationFormValues } from '../schemas/invitation.schema'

interface AcceptInvitationPageProps {
  readonly token?: string
}

export function AcceptInvitationPage({ token }: AcceptInvitationPageProps) {
  const acceptMutation = useAcceptInvitationMutation()
  const previewQuery = useInvitationPreviewQuery(token ?? '')
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

  return (
    <AcceptInvitationForm
      token={token}
      preview={previewQuery.data}
      isPreviewLoading={previewQuery.isLoading}
      isLoading={acceptMutation.isPending}
      isSuccess={isSuccess}
      errorMessage={previewQuery.error?.message}
      actionErrorMessage={actionErrorMessage}
      onSubmit={acceptInvitation}
    />
  )
}
