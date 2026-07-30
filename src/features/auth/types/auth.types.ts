import type { UserRole } from '@/config/roles'

export interface AuthUser {
  id: string
  tenantId: string
  fullName: string
  email: string
  role: UserRole
  isActive: boolean
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number
  requires2FA: boolean
  tempToken: string | null
}

export interface Verify2FARequestDto {
  tempToken: string
  otp: string
}

export interface ChangePasswordRequestDto {
  currentPassword: string
  newPassword: string
}

export interface RegisterRequestDto {
  tenantName: string
  ownerName: string
  phone: string
  email: string
  address: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export type RegisterResponseDto = string

export type VerifyEmailResponseDto = string

export interface ForgotPasswordRequestDto {
  email: string
}

export type ForgotPasswordResponseDto = unknown

export interface ResetPasswordRequestDto {
  token: string
  newPassword: string
}

export type ResetPasswordResponseDto = unknown

export interface UserProfileResponse {
  id: string
  tenantId: string
  fullName: string
  email: string
  phone: string | null
  role: string | null
  status: string
  lastLoginAt: string | null
  emailVerified: boolean
  phoneVerified: boolean
  isTwoFactorEnabled: boolean
}
