import { describe, expect, it } from 'vitest'
import { getTemporaryLockSeconds } from './temporary-lock'

describe('getTemporaryLockSeconds', () => {
  it('uses the remaining lock TTL returned by the backend', () => {
    expect(getTemporaryLockSeconds({ errors: { retryAfterSeconds: ['13'] } })).toBe(13)
  })

  it('uses a safe fallback when the backend value is missing or invalid', () => {
    expect(getTemporaryLockSeconds({ errors: undefined })).toBe(900)
    expect(getTemporaryLockSeconds({ errors: { retryAfterSeconds: ['not-a-number'] } })).toBe(900)
  })
})
