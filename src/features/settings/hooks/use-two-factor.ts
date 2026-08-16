import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse } from '@/types/api'
import { settingsService } from '../services/settings.service'

const SETUP_EXPIRED_MESSAGE = 'Phiên thiết lập 2FA đã hết hạn. Vui lòng thử lại.'
const INVALID_OTP_MESSAGE = 'Mã OTP không đúng. Vui lòng kiểm tra lại ứng dụng xác thực.'

export type ConfirmTwoFactorErrorKind = 'setupExpired' | 'invalidOtp' | 'network' | 'unknown'

export function classifyConfirmError(error: ApiErrorResponse): ConfirmTwoFactorErrorKind {
  // Backend chỉ trả BadRequestException(400, message) cho 2 case đã biết, không có
  // code riêng — đã xác minh Confirm2FACommandHandler.cs. So khớp exact message vì
  // đây là identifier ổn định duy nhất khả dụng cho 2 case cụ thể này; KHÔNG coi mọi
  // 400 khác là "OTP sai" — 400 không khớp 1 trong 2 message rơi vào 'unknown'.
  if (error.statusCode === 400 && error.message === SETUP_EXPIRED_MESSAGE) return 'setupExpired'
  if (error.statusCode === 400 && error.message === INVALID_OTP_MESSAGE) return 'invalidOtp'
  if (error.statusCode === 0 || error.statusCode >= 500) return 'network'
  return 'unknown'
}

export function useTwoFactorSetupMutation() {
  return useMutation({
    mutationFn: settingsService.setup2FA,
    onError: (error: ApiErrorResponse) => {
      // Không toast ở đây — EnableTwoFactorDialog hiển thị lỗi qua step 'setupError'
      // (đã có UI inline riêng), tránh trùng lặp toast + inline cho cùng 1 lỗi.
      console.error(error)
    },
  })
}

export function useTwoFactorConfirmMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsService.confirm2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
    onError: (error: ApiErrorResponse) => {
      // Không toast ở đây — EnableTwoFactorDialog classify (setupExpired/invalidOtp/
      // network/unknown) và tự hiển thị lỗi, tránh trùng lặp toast + inline.
      console.error(error)
    },
  })
}

export function useTwoFactorDisableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsService.disable2FA,
    onSuccess: (response) => {
      toast.success(response.data)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
    onError: (error: ApiErrorResponse) => {
      console.error(error)
      toast.error(error.message ?? 'Không thể tắt xác thực hai yếu tố. Vui lòng thử lại.')
    },
  })
}
