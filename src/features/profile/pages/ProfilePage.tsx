'use client'

import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import type { ApiErrorResponse } from '@/types/api'
import { useMeQuery, useUpdateProfileMutation } from '@/features/auth/hooks/use-auth'
import { SectionIconBadge } from '@/features/settings/components/SecurityPage'
import {
  ProfileForm,
  ProfileOverviewCard,
  ProfileView,
  type ProfileFormSubmitContext,
} from '../components'
import {
  updateProfileRequestSchema,
  type ProfileFormValues,
  type UpdateProfileFormRequest,
} from '../schemas/profile.schema'

const serverFieldMap = {
  FullName: 'fullName',
  Email: 'email',
  Phone: 'phone',
} as const

function isServerField(field: string): field is keyof typeof serverFieldMap {
  return Object.hasOwn(serverFieldMap, field)
}

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

function applyServerErrors(
  error: ApiErrorResponse,
  setError: ProfileFormSubmitContext['setError']
) {
  if (!error.errors) return false
  let applied = false
  for (const [field, messages] of Object.entries(error.errors)) {
    if (!isServerField(field) || !messages[0]) continue
    setError(serverFieldMap[field], { type: 'server', message: messages[0] })
    applied = true
  }
  return applied
}

function buildUpdateRequest(
  values: ProfileFormValues,
  dirtyFields: ProfileFormSubmitContext['dirtyFields']
): UpdateProfileFormRequest {
  return updateProfileRequestSchema.parse({
    ...(dirtyFields.fullName ? { fullName: values.fullName } : {}),
    ...(dirtyFields.email ? { email: values.email } : {}),
    ...(dirtyFields.phone ? { phone: values.phone } : {}),
  })
}

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const meQuery = useMeQuery()
  const updateMutation = useUpdateProfileMutation()

  async function handleSubmit(values: ProfileFormValues, context: ProfileFormSubmitContext) {
    const request = buildUpdateRequest(values, context.dirtyFields)
    if (Object.keys(request).length === 0) return true

    try {
      await updateMutation.mutateAsync(request)
      toast.success('Đã cập nhật hồ sơ cá nhân.')
      setIsEditing(false)
      return true
    } catch (error) {
      logger.error(error)
      if (!isApiErrorResponse(error)) {
        toast.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.')
        return false
      }
      if (applyServerErrors(error, context.setError)) {
        toast.error('Vui lòng kiểm tra lại thông tin.')
      } else {
        toast.error(error.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.')
      }
      return false
    }
  }

  return (
    <div className="space-y-7">
      <div className="animate-in fade-in slide-in-from-top-3 flex items-center gap-3.5 duration-400">
        <SectionIconBadge icon={UserRound} tone="primary" size="lg" />
        <div>
          <h2 className="text-foreground text-[22px] font-bold">Hồ sơ cá nhân</h2>
          <p className="text-muted-foreground mt-0.5 text-[13.5px]">
            Quản lý thông tin cá nhân và liên hệ của tài khoản
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
        <ProfileOverviewCard profile={meQuery.data} isLoading={meQuery.isLoading} />

        <div className="min-w-0">
          {meQuery.isError && (
            <div className="bg-card ring-foreground/10 flex min-h-48 flex-col items-center justify-center gap-3 rounded-none px-4 text-center ring-1">
              <p className="text-sm font-medium">Không thể tải thông tin hồ sơ</p>
              <p className="text-muted-foreground text-xs">
                Vui lòng kiểm tra kết nối rồi thử lại.
              </p>
              <button
                type="button"
                onClick={() => void meQuery.refetch()}
                className="text-primary text-xs font-medium hover:underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {meQuery.data &&
            (isEditing ? (
              <ProfileForm
                key={`${meQuery.data.id}-edit`}
                profile={meQuery.data}
                isPending={updateMutation.isPending}
                onCancel={() => {
                  updateMutation.reset()
                  setIsEditing(false)
                }}
                onSubmit={handleSubmit}
              />
            ) : (
              <ProfileView profile={meQuery.data} onEdit={() => setIsEditing(true)} />
            ))}
        </div>
      </div>
    </div>
  )
}
