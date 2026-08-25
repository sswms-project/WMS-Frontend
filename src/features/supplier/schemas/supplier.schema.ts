import { z } from 'zod'

export const saveSupplierSchema = z.object({
  supplierName: z
    .string()
    .trim()
    .min(1, 'Tên nhà cung cấp là bắt buộc.')
    .max(255, 'Tên nhà cung cấp tối đa 255 ký tự.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Số điện thoại là bắt buộc.')
    .max(30, 'Số điện thoại tối đa 30 ký tự.'),
  email: z
    .string()
    .trim()
    .max(255, 'Email tối đa 255 ký tự.')
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
      message: 'Email không hợp lệ.',
    }),
  address: z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự.'),
})

export type SaveSupplierFormValues = z.infer<typeof saveSupplierSchema>
