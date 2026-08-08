import { z } from 'zod'
import { USER_ROLES } from '@/config/roles'

export const INVITABLE_ROLES = [USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff] as const

export const acceptInvitationPasswordRequirements = [
  {
    id: 'min-length',
    label: 'Ít nhất 8 ký tự',
    message: 'Mật khẩu phải có ít nhất 8 ký tự',
    validate: (value: string) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Có ít nhất một chữ hoa',
    message: 'Mật khẩu phải có ít nhất một chữ hoa',
    validate: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'Có ít nhất một chữ thường',
    message: 'Mật khẩu phải có ít nhất một chữ thường',
    validate: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'Có ít nhất một chữ số',
    message: 'Mật khẩu phải có ít nhất một chữ số',
    validate: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'special-character',
    label: 'Có ít nhất một ký tự đặc biệt',
    message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt',
    validate: (value: string) => /[^a-zA-Z0-9]/.test(value),
  },
] as const

export const sendInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự'),
  role: z.enum(INVITABLE_ROLES),
})

export const acceptInvitationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Họ và tên là bắt buộc')
      .max(255, 'Họ và tên không được vượt quá 255 ký tự'),
    password: z
      .string()
      .refine(
        acceptInvitationPasswordRequirements[0].validate,
        acceptInvitationPasswordRequirements[0].message
      )
      .refine(
        acceptInvitationPasswordRequirements[1].validate,
        acceptInvitationPasswordRequirements[1].message
      )
      .refine(
        acceptInvitationPasswordRequirements[2].validate,
        acceptInvitationPasswordRequirements[2].message
      )
      .refine(
        acceptInvitationPasswordRequirements[3].validate,
        acceptInvitationPasswordRequirements[3].message
      )
      .refine(
        acceptInvitationPasswordRequirements[4].validate,
        acceptInvitationPasswordRequirements[4].message
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })

export type SendInvitationFormValues = z.infer<typeof sendInvitationSchema>
export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>
