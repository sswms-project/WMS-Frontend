import type { ApiErrorResponse } from '@/types/api'

const FALLBACK_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại.'

const isApiError = (value: unknown): value is ApiErrorResponse =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ApiErrorResponse).statusCode === 'number' &&
  typeof (value as ApiErrorResponse).message === 'string'

// FluentValidation returns { field: [msg, ...] }; flatten it so the user sees which
// field failed instead of a bare "Validation failed".
const flattenFieldErrors = (errors: Record<string, string[]>): string =>
  Object.entries(errors)
    .filter(([field]) => field !== 'code')
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join(' | ')

/** Stable machine-readable error code returned through the API error envelope. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined
  return error.errors?.code?.find((code) => code.trim().length > 0)
}

/** Human-readable message for a toast. */
export function getApiErrorMessage(error: unknown, fallback = FALLBACK_MESSAGE): string {
  if (!isApiError(error)) return error instanceof Error ? error.message : fallback

  const fieldErrors = error.errors ? flattenFieldErrors(error.errors) : ''
  return fieldErrors ? `${error.message} — ${fieldErrors}` : error.message
}

/**
 * Single-line form for `logger.error`. Plain objects serialize to `{}` in the Next.js
 * dev overlay, which hides the status code and field errors we actually need.
 */
export function formatApiError(error: unknown): string {
  if (!isApiError(error)) return String(error)
  return `[${error.statusCode}] ${getApiErrorMessage(error)}`
}
