import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { acceptInvitationSchema, sendInvitationSchema } from './invitation.schema'

describe('invitation schemas', () => {
  it('accepts roles supported by the backend', () => {
    expect(
      sendInvitationSchema.safeParse({
        email: 'manager@example.com',
        role: USER_ROLES.WarehouseManager,
      }).success
    ).toBe(true)
    expect(
      sendInvitationSchema.safeParse({
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
      }).success
    ).toBe(true)
  })

  it('rejects unsupported roles', () => {
    expect(
      sendInvitationSchema.safeParse({
        email: 'owner@example.com',
        role: USER_ROLES.TenantOwner,
      }).success
    ).toBe(false)
  })

  it('requires matching passwords with at least eight characters', () => {
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: '12345678',
        confirmPassword: '12345678',
      }).success
    ).toBe(true)
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: '12345678',
        confirmPassword: '87654321',
      }).success
    ).toBe(false)
  })
})
