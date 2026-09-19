import { z } from 'zod'

export const resendVerificationSchema = z.object({
  email: z.string().trim().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
})

export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>
