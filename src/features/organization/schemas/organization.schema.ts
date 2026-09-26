import { z } from 'zod'

const phonePattern = /^\+?[0-9\s-]{7,20}$/

export const organizationFormSchema = z.object({
  tenantName: z
    .string()
    .trim()
    .min(1, 'Tên tổ chức là bắt buộc.')
    .max(255, 'Tên tổ chức tối đa 255 ký tự.'),
  phone: z
    .string()
    .trim()
    .regex(
      phonePattern,
      'Số điện thoại phải có 7-20 chữ số và có thể chứa +, khoảng trắng hoặc dấu gạch ngang.'
    ),
  address: z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự.'),
})

export const updateOrganizationRequestSchema = organizationFormSchema.partial()

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>
export type UpdateOrganizationRequest = z.infer<typeof updateOrganizationRequestSchema>
