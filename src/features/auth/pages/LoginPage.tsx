'use client'

import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LoginForm } from '../components/LoginPage'
import { useLoginMutation } from '../hooks/use-auth'
import type { LoginFormValues } from '../schemas/login.schema'
import type { AuthUser } from '../types/auth.types'
import { decodeJwtUser } from '../utils/decode-jwt-user'
import { clearTwoFactorTempToken, saveTwoFactorTempToken } from '../utils/two-factor-temp-token'

export function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const loginMutation = useLoginMutation()

  async function handleLogin(values: LoginFormValues) {
    clearTwoFactorTempToken()

    try {
      const response = await loginMutation.mutateAsync(values)
      const data = response.data

      if (data.requires2FA) {
        const tempToken = data.tempToken?.trim()

        if (!tempToken) {
          clearTwoFactorTempToken()
          toast.error('Không thể bắt đầu phiên xác thực hai yếu tố. Vui lòng thử lại.')
          return
        }

        saveTwoFactorTempToken(tempToken)
        router.replace(APP_ROUTES.auth.verify2fa)
        return
      }

      const accessToken = data.accessToken?.trim()
      const refreshToken = data.refreshToken?.trim()

      if (!accessToken || !refreshToken) {
        toast.error('Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.')
        return
      }

      let user: AuthUser
      try {
        user = decodeJwtUser(accessToken)
      } catch (error) {
        console.error('Failed to decode access token', error)
        toast.error('Không thể hoàn tất đăng nhập.')
        return
      }

      clearTwoFactorTempToken()
      setAuth(user, accessToken, refreshToken)
      router.replace(APP_ROUTES.dashboard)
    } catch {
      // onError in useLoginMutation handles logging + toast
    }
  }

  return <LoginForm onSubmit={handleLogin} isLoading={loginMutation.isPending} />
}
