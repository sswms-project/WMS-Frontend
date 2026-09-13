import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  UpdateProfileRequest,
  UserProfileResponse,
  Verify2FARequestDto,
  VerifyEmailResponseDto,
} from '../types/auth.types'

export const authService = {
  login: (body: LoginRequestDto) =>
    axiosClient
      .post<ApiResponse<LoginResponseDto>>(API_ENDPOINTS.auth.login, body)
      .then((r) => r.data),

  registerTenant: (body: RegisterRequestDto) =>
    axiosClient
      .post<ApiResponse<RegisterResponseDto>>(API_ENDPOINTS.auth.register, body)
      .then((r) => r.data),

  verifyEmail: (token: string) =>
    axiosClient
      .get<ApiResponse<VerifyEmailResponseDto>>(API_ENDPOINTS.auth.verifyEmail, {
        params: { token },
      })
      .then((r) => r.data),

  forgotPassword: (body: ForgotPasswordRequestDto) =>
    axiosClient
      .post<ApiResponse<ForgotPasswordResponseDto>>(API_ENDPOINTS.auth.forgotPassword, body)
      .then((r) => r.data),

  resetPassword: (body: ResetPasswordRequestDto) =>
    axiosClient
      .post<ApiResponse<ResetPasswordResponseDto>>(API_ENDPOINTS.auth.resetPassword, body)
      .then((r) => r.data),

  getMe: () =>
    axiosClient.get<ApiResponse<UserProfileResponse>>(API_ENDPOINTS.auth.me).then((r) => r.data),

  updateMe: (body: UpdateProfileRequest) =>
    axiosClient
      .put<ApiResponse<UserProfileResponse>>(API_ENDPOINTS.auth.me, body)
      .then((r) => r.data),

  verify2FA: (body: Verify2FARequestDto) =>
    axiosClient
      .post<ApiResponse<LoginResponseDto>>(API_ENDPOINTS.auth.verify2fa, body)
      .then((r) => r.data),

  changePassword: (body: ChangePasswordRequestDto) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.auth.changePassword, body)
      .then((r) => r.data),

  logout: () =>
    axiosClient.post<ApiResponse<unknown>>(API_ENDPOINTS.auth.logout).then((r) => r.data),
}
