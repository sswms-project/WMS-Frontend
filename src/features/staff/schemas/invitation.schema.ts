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
  {
    id: 'uppercase',
    label: 'Có chữ hoa',
    message: 'Mật khẩu phải có ít nhất một chữ hoa',
    validate: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'Có chữ thường',
    message: 'Mật khẩu phải có ít nhất một chữ thường',
    validate: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'Có chữ số',
    message: 'Mật khẩu phải có ít nhất một chữ số',
    validate: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'Có ký tự đặc biệt',
    message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt',
    validate: (value: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(value),
  },
] as const

export const sendInvitationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Họ và tên là bắt buộc')
    .max(300, 'Họ và tên không được vượt quá 300 ký tự'),
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(320, 'Email không được vượt quá 320 ký tự'),
  role: z.enum(INVITABLE_ROLES),
  warehouseIds: z
    .array(dotNetGuidSchema('Kho được chọn không hợp lệ'))
    .min(1, 'Vui lòng chọn ít nhất một kho')
    .max(100, 'Không thể chọn quá 100 kho')
    .refine((ids) => new Set(ids).size === ids.length, 'Danh sách kho không được trùng lặp'),
})

export function createAcceptInvitationSchema(requiresFullName: boolean) {
  return z
    .object({
      fullName: z.string().trim().max(300, 'Họ và tên không được vượt quá 300 ký tự').optional(),
      password: z.string().superRefine((value, context) => {
        acceptInvitationPasswordRequirements.forEach((requirement) => {
          if (!requirement.validate(value)) {
            context.addIssue({ code: 'custom', message: requirement.message })
          }
        })
      }),
      confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .superRefine((values, context) => {
      if (requiresFullName && !values.fullName?.trim()) {
        context.addIssue({
          code: 'custom',
          path: ['fullName'],
          message: 'Họ và tên là bắt buộc',
        })
      }
      if (values.password !== values.confirmPassword) {
        context.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'Mật khẩu xác nhận không khớp',
        })
      }
    })
}

export const acceptInvitationSchema = createAcceptInvitationSchema(false)

export type SendInvitationFormValues = z.infer<typeof sendInvitationSchema>
export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>
