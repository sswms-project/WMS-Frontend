import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type { Confirm2FARequest, Setup2FAResponse } from '../types/settings.types'

export const settingsService = {
  setup2FA: () =>
    axiosClient
      .post<ApiResponse<Setup2FAResponse>>(API_ENDPOINTS.settings.setup2fa)
      .then((r) => r.data),

  confirm2FA: (body: Confirm2FARequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.settings.confirm2fa, body)
      .then((r) => r.data),

  disable2FA: () =>
    axiosClient.delete<ApiResponse<string>>(API_ENDPOINTS.settings.disable2fa).then((r) => r.data),
}
