import { z } from 'zod'

export const verifyTwoFactorSchema = z.object({
  otp: z
    .string()
    .length(6, 'Mã OTP phải gồm đúng 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ gồm chữ số'),
})

export type VerifyTwoFactorFormValues = z.infer<typeof verifyTwoFactorSchema>
