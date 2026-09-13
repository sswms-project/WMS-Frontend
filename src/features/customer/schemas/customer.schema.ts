import { z } from 'zod'

export const customerSchema = z.object({
  customerName: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng.').max(255),
  phone: z.string().trim().min(1, 'Vui lòng nhập số điện thoại.').max(30),
  email: z
    .string()
    .trim()
    .max(255)
    .refine((value) => !value || z.email().safeParse(value).success, 'Email không hợp lệ.'),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ.').max(500),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
