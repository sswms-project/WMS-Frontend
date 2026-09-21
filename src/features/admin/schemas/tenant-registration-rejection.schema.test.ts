import { describe, expect, it } from 'vitest'
import { tenantRegistrationRejectionSchema } from './tenant-registration-rejection.schema'

describe('tenantRegistrationRejectionSchema', () => {
  it('requires a meaningful rejection reason', () => {
    expect(tenantRegistrationRejectionSchema.safeParse({ reason: '   ' }).success).toBe(false)
    expect(
      tenantRegistrationRejectionSchema.safeParse({ reason: 'Thiếu hồ sơ đăng ký' }).success
    ).toBe(true)
  })

  it('limits the rejection reason to 500 characters', () => {
    expect(tenantRegistrationRejectionSchema.safeParse({ reason: 'a'.repeat(501) }).success).toBe(
      false
    )
  })
})
