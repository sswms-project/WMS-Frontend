import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import {
  acceptInvitationSchema,
  createAcceptInvitationSchema,
  sendInvitationSchema,
} from './invitation.schema'

const warehouseIds = ['11111111-1111-1111-1111-111111111111']

describe('invitation schemas', () => {
  it.each([USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff])(
    'requires a name and at least one warehouse for %s',
    (role) => {
      expect(
        sendInvitationSchema.safeParse({
          fullName: 'A',
          email: 'member@example.com',
          role,
          warehouseIds: [],
        }).success
      ).toBe(false)
      expect(
        sendInvitationSchema.safeParse({
          fullName: 'Nguyen Van A',
          email: 'member@example.com',
          role,
          warehouseIds,
        }).success
      ).toBe(true)
    }
  )

  it('rejects unsupported roles and duplicate warehouses', () => {
    expect(
      sendInvitationSchema.safeParse({
        fullName: 'Owner',
        email: 'owner@example.com',
        role: USER_ROLES.TenantOwner,
        warehouseIds,
      }).success
    ).toBe(false)
    expect(
      sendInvitationSchema.safeParse({
        fullName: 'Staff',
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
        warehouseIds: [...warehouseIds, ...warehouseIds],
      }).success
    ).toBe(false)
  })

  it('requires a strong matching password without accepting profile fields', () => {
    expect(
      acceptInvitationSchema.safeParse({ password: 'Strong1!', confirmPassword: 'Strong1!' })
        .success
    ).toBe(true)
    expect(
      acceptInvitationSchema.safeParse({ password: 'abcdefgh', confirmPassword: 'abcdefgh' })
        .success
    ).toBe(false)
    expect(
      acceptInvitationSchema.safeParse({ password: 'Strong1!', confirmPassword: 'Different1!' })
        .success
    ).toBe(false)
  })

  it('uses the same explicit special-character set as the backend', () => {
    expect(
      acceptInvitationSchema.safeParse({ password: 'Abcdef1@', confirmPassword: 'Abcdef1@' })
        .success
    ).toBe(true)
    expect(
      acceptInvitationSchema.safeParse({ password: 'Abcdef1ă', confirmPassword: 'Abcdef1ă' })
        .success
    ).toBe(false)
    expect(
      acceptInvitationSchema.safeParse({ password: 'Abcdef1 ', confirmPassword: 'Abcdef1 ' })
        .success
    ).toBe(false)
  })

  it('requires a full name only for legacy invitations that do not persist one', () => {
    const values = { password: 'Strong1!', confirmPassword: 'Strong1!' }

    expect(createAcceptInvitationSchema(false).safeParse(values).success).toBe(true)
    expect(createAcceptInvitationSchema(true).safeParse(values).success).toBe(false)
    expect(
      createAcceptInvitationSchema(true).safeParse({ ...values, fullName: 'Nguyen Van A' }).success
    ).toBe(true)
  })

  it('enforces backend-aligned email and full name lengths', () => {
    const overlongEmail = `${'a'.repeat(309)}@example.com`
    expect(
      sendInvitationSchema.safeParse({
        fullName: 'A',
        email: overlongEmail,
        role: USER_ROLES.WarehouseStaff,
        warehouseIds,
      }).success
    ).toBe(false)
    expect(
      sendInvitationSchema.safeParse({
        fullName: 'a'.repeat(301),
        email: 'staff@example.com',
        role: USER_ROLES.WarehouseStaff,
        warehouseIds,
      }).success
    ).toBe(false)
  })
})
