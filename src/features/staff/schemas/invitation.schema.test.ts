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

  it('requires the backend minimum password length', () => {
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: 'Strong1!',
        confirmPassword: 'Strong1!',
      }).success
    ).toBe(true)

    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: '1234567',
        confirmPassword: '1234567',
      }).success
    ).toBe(false)

    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'Nguyen Van A',
        password: 'abcdefgh',
        confirmPassword: 'abcdefgh',
      }).success
    ).toBe(true)
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
    const overlongEmail = `${'a'.repeat(309)}@example.com`

    expect(
      sendInvitationSchema.safeParse({
        email: overlongEmail,
        role: USER_ROLES.WarehouseStaff,
      }).success
    ).toBe(false)
    expect(
      acceptInvitationSchema.safeParse({
        fullName: 'a'.repeat(301),
        password: 'Strong1!',
        confirmPassword: 'Strong1!',
      }).success
    ).toBe(false)
  })
})
