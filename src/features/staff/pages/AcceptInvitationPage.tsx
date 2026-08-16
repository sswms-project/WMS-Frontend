'use client'

import { useState } from 'react'
import { AcceptInvitationForm } from '../components/AcceptInvitationPage'
import { useAcceptInvitationMutation } from '../hooks/use-invitations'
import type { AcceptInvitationFormValues } from '../schemas/invitation.schema'

interface AcceptInvitationPageProps {
  readonly token?: string
}

export function AcceptInvitationPage({ token }: AcceptInvitationPageProps) {
  const acceptMutation = useAcceptInvitationMutation()
  const [isSuccess, setIsSuccess] = useState(false)

  async function acceptInvitation(values: AcceptInvitationFormValues) {
    if (!token) return

    try {
      await acceptMutation.mutateAsync({
        token,
        request: {
          fullName: values.fullName,
          password: values.password,
        },
      })
      setIsSuccess(true)
    } catch {
      // The form keeps the API message visible so expired and reused links remain actionable.
    }
  }

  return (
    <AcceptInvitationForm
      token={token}
      isLoading={acceptMutation.isPending}
      isSuccess={isSuccess}
      errorMessage={acceptMutation.error?.message}
      onSubmit={acceptInvitation}
    />
  )
}
