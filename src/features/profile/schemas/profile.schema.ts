import { z } from 'zod'

const phonePattern = /^(0|\+84)[3-9][0-9]{8}$/

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Họ và tên là bắt buộc.')
    .max(255, 'Họ và tên tối đa 255 ký tự.'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || phonePattern.test(val),
      'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số.'
    ),
})

export const updateProfileRequestSchema = profileFormSchema.partial()

export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type UpdateProfileFormRequest = z.infer<typeof updateProfileRequestSchema>
