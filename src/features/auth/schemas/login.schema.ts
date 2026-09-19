import { z } from 'zod'

export const loginSchema = z
  .object({
    email: z.string().email('Nhập email hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    captchaId: z.string().optional(),
    captchaAnswer: z.string().trim().max(20, 'Câu trả lời CAPTCHA không hợp lệ').optional(),
  })
  .superRefine((values, context) => {
    if (values.captchaId && !values.captchaAnswer) {
      context.addIssue({
        code: 'custom',
        path: ['captchaAnswer'],
        message: 'Vui lòng nhập kết quả CAPTCHA',
      })
    }
  })

export type LoginFormValues = z.infer<typeof loginSchema>
