import { describe, expect, it } from 'vitest'
import { tenantStateSchema } from './tenant-state.schema'

describe('tenantStateSchema', () => {
  it('requires a meaningful audit reason', () => {
    expect(tenantStateSchema.safeParse({ reason: '   ' }).success).toBe(false)
    expect(tenantStateSchema.safeParse({ reason: 'Vi phạm điều khoản dịch vụ' }).success).toBe(true)
  })

  it('limits the persisted reason to 500 characters', () => {
    expect(tenantStateSchema.safeParse({ reason: 'a'.repeat(501) }).success).toBe(false)
  })
})
