import { z } from 'zod'
import { passwordRequirements } from '@/features/auth/schemas/register.schema'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .refine(passwordRequirements[0].validate, passwordRequirements[0].message)
      .refine(passwordRequirements[1].validate, passwordRequirements[1].message)
      .refine(passwordRequirements[2].validate, passwordRequirements[2].message)
      .refine(passwordRequirements[3].validate, passwordRequirements[3].message)
      .refine(passwordRequirements[4].validate, passwordRequirements[4].message),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
