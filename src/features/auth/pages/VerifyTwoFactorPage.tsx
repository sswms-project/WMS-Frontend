'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { VerifyTwoFactorForm, type VerifyStep } from '../components/VerifyTwoFactorPage'
import { decodeJwtUser } from '../utils/decode-jwt-user'
import { clearTwoFactorTempToken, getTwoFactorTempToken } from '../utils/two-factor-temp-token'
import {
  classifyVerify2FAError,
  isAccountInactiveError,
  shouldClearTempTokenOnError,
  useVerify2FAMutation,
  type Verify2FAErrorKind,
} from '../hooks/use-auth'
import type { VerifyTwoFactorFormValues } from '../schemas/verify-two-factor.schema'
import type { AuthUser } from '../types/auth.types'

// sessionStorage chỉ có ở client — dùng cùng kỹ thuật useSyncExternalStore đã có ở
// ProtectedRoute.tsx để biết đã qua hydration hay chưa, tránh gọi setState trong
// effect (bị React Compiler chặn) và tránh hydration mismatch.
function subscribeToHydration() {
  return () => {}
}

export function VerifyTwoFactorPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const verifyMutation = useVerify2FAMutation()

  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  )
  const [forcedMissing, setForcedMissing] = useState(false)
  const [step, setStep] = useState<VerifyStep>({ status: 'form' })
  const [apiErrorKind, setApiErrorKind] = useState<Verify2FAErrorKind | null>(null)
  const verifyFlowIdRef = useRef(0)

  const tempToken = hasHydrated && !forcedMissing ? (getTwoFactorTempToken()?.trim() ?? null) : null
  const tempTokenStatus: 'loading' | 'missing' | 'ready' = !hasHydrated
    ? 'loading'
    : tempToken
      ? 'ready'
      : 'missing'

  useEffect(() => {
    return () => {
      // Rời trang bằng cách khác (browser back, điều hướng khác) cũng vô hiệu hoá callback cũ.
      verifyFlowIdRef.current += 1
    }
  }, [])

  function handleBackToLogin() {
    verifyFlowIdRef.current += 1
    clearTwoFactorTempToken()
    verifyMutation.reset()
    router.replace(APP_ROUTES.auth.login)
  }

  function handleErrorClear() {
    setApiErrorKind(null)
  }

  function handleVerify(values: VerifyTwoFactorFormValues) {
    if (tempTokenStatus !== 'ready' || !tempToken) {
      clearTwoFactorTempToken()
      setForcedMissing(true)
      return
    }
    if (verifyMutation.isPending) return

    const flowId = verifyFlowIdRef.current

    verifyMutation.mutate(
      { tempToken, otp: values.otp },
      {
        onSuccess: (response) => {
          if (flowId !== verifyFlowIdRef.current) return

          const result = response.data
          const accessToken = result.accessToken?.trim()
          const refreshToken = result.refreshToken?.trim()

          if (result.requires2FA || !accessToken || !refreshToken) {
            toast.error('Phản hồi xác thực hai yếu tố không hợp lệ. Vui lòng thử lại.')
            return
          }

          let user: AuthUser
          try {
            user = decodeJwtUser(accessToken)
          } catch (error) {
            console.error('Failed to decode verified access token', error)
            toast.error('Không thể hoàn tất đăng nhập.')
            return
          }

          clearTwoFactorTempToken()
          setAuth(user, accessToken, refreshToken)
          router.replace(APP_ROUTES.dashboard)
        },
        onError: (error) => {
          if (flowId !== verifyFlowIdRef.current) return

          const kind = classifyVerify2FAError(error)
          if (shouldClearTempTokenOnError(kind)) clearTwoFactorTempToken()

          if (kind === 'sessionExpired') {
            setStep({ status: 'sessionExpired' })
            return
          }
          if (kind === 'accountUnavailable') {
            setStep({
              status: 'accountUnavailable',
              reason: isAccountInactiveError(error) ? 'inactive' : 'userNotFound',
            })
            return
          }
          setApiErrorKind(kind)
        },
      }
    )
  }

  return (
    <VerifyTwoFactorForm
      tempTokenStatus={tempTokenStatus}
      step={step}
      onSubmit={handleVerify}
      isLoading={verifyMutation.isPending}
      apiErrorKind={apiErrorKind}
      onErrorClear={handleErrorClear}
      onBackToLogin={handleBackToLogin}
    />
  )
}
