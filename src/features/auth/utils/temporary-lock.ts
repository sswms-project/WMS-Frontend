import type { ApiErrorResponse } from '@/types/api'

const DEFAULT_LOCK_SECONDS = 900

export function getTemporaryLockSeconds(error: Pick<ApiErrorResponse, 'errors'>): number {
  const retryAfter = Number(error.errors?.retryAfterSeconds?.[0])
  return Number.isFinite(retryAfter) && retryAfter > 0
    ? Math.ceil(retryAfter)
    : DEFAULT_LOCK_SECONDS
}
