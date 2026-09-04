import { z } from 'zod'
import { USER_ROLES } from '@/config/roles'
import { dotNetGuidSchema } from './dotnet-guid.schema'

export const INVITABLE_ROLES = [USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff] as const

export const acceptInvitationPasswordRequirements = [
  {
    id: 'min-length',
    label: 'Ít nhất 8 ký tự',
    message: 'Mật khẩu phải có ít nhất 8 ký tự',
    validate: (value: string) => value.length >= 8,
  },
] as const

export const sendInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(320, 'Email không được vượt quá 320 ký tự'),
  role: z.enum(INVITABLE_ROLES),
  warehouseId: dotNetGuidSchema('Vui lòng chọn kho làm việc ban đầu'),
})

export const acceptInvitationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Họ và tên là bắt buộc')
      .max(300, 'Họ và tên không được vượt quá 300 ký tự'),
    password: z
      .string()
      .refine(
        acceptInvitationPasswordRequirements[0].validate,
        acceptInvitationPasswordRequirements[0].message
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })

export type SendInvitationFormValues = z.infer<typeof sendInvitationSchema>
export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>
