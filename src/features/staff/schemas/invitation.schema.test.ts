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

  it('requires a password that matches the invitation password policy', () => {
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: 'Strong1!',
        confirmPassword: 'Strong1!',
      }).success
    ).toBe(true)

    const invalidPasswords = ['Short1!', 'lowercase1!', 'UPPERCASE1!', 'NoNumber!', 'NoSpecial1']

    invalidPasswords.forEach((password) => {
      expect(
        acceptInvitationSchema.safeParse({
          fullName: 'Nguyen Van A',
          password,
          confirmPassword: password,
        }).success
      ).toBe(false)
    })
  })

  it('requires matching passwords', () => {
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: 'Strong1!',
        confirmPassword: 'Different1!',
      }).success
    ).toBe(false)
  })

  it('enforces backend-aligned email and full name lengths', () => {
    const overlongEmail = `${'a'.repeat(244)}@example.com`

    expect(
      sendInvitationSchema.safeParse({
        email: overlongEmail,
        role: USER_ROLES.WarehouseStaff,
      }).success
    ).toBe(false)
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'a'.repeat(256),
        password: 'Strong1!',
        confirmPassword: 'Strong1!',
      }).success
    ).toBe(false)
  })
})
