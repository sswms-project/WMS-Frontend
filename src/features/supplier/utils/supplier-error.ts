import type { ApiErrorResponse } from '@/types/api'

export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return isApiErrorResponse(error) && error.message ? error.message : fallbackMessage
}
