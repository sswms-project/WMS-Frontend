import { z } from 'zod'

const phonePattern = /^\+?[0-9\s-]{7,20}$/

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Họ và tên là bắt buộc.')
    .max(255, 'Họ và tên tối đa 255 ký tự.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || phonePattern.test(val),
      'Số điện thoại phải có 7-20 chữ số và có thể chứa +, khoảng trắng hoặc dấu gạch ngang.'
    ),
})

export const updateProfileRequestSchema = profileFormSchema.partial()

export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type UpdateProfileFormRequest = z.infer<typeof updateProfileRequestSchema>
