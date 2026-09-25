import { z } from 'zod'

export const stockRecipientSchema = z.object({
  recipientCode: z.string().trim().min(1, 'Vui lòng nhập mã khách hàng.').max(50),
  recipientName: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng.').max(255),
  taxCode: z.string().trim().max(50, 'Mã số thuế tối đa 50 ký tự.'),
  phone: z.string().trim().max(30),
  email: z
    .string()
    .trim()
    .max(255)
    .refine((value) => !value || z.email().safeParse(value).success, 'Email không hợp lệ.'),
  address: z.string().trim().max(500),
})

export type StockRecipientFormValues = z.infer<typeof stockRecipientSchema>
