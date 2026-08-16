export const TWO_FACTOR_TEMP_TOKEN_KEY = 'auth_2fa_temp_token'

export function saveTwoFactorTempToken(tempToken: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(TWO_FACTOR_TEMP_TOKEN_KEY, tempToken)
}

export function getTwoFactorTempToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(TWO_FACTOR_TEMP_TOKEN_KEY)
}

export function clearTwoFactorTempToken(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(TWO_FACTOR_TEMP_TOKEN_KEY)
}
