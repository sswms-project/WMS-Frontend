import { z } from 'zod'

const phonePattern = /^\+?[0-9\s-]{7,20}$/

export const organizationFormSchema = z.object({
  tenantName: z
    .string()
    .trim()
    .min(1, 'Tên doanh nghiệp là bắt buộc.')
    .max(255, 'Tên doanh nghiệp tối đa 255 ký tự.'),
  phone: z
    .string()
    .trim()
    .regex(
      phonePattern,
      'Số điện thoại phải có 7-20 chữ số và có thể chứa +, khoảng trắng hoặc dấu gạch ngang.'
    ),
  address: z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự.'),
  taxCode: z.string().trim().max(50, 'Mã số thuế tối đa 50 ký tự.'),
  website: z
    .string()
    .trim()
    .max(255, 'Website tối đa 255 ký tự.')
    .refine((value) => value === '' || /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(value), {
      message: 'Website không hợp lệ.',
    }),
  industry: z.string().trim().max(255, 'Ngành nghề tối đa 255 ký tự.'),
})

export const updateOrganizationRequestSchema = organizationFormSchema.partial()

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>
export type UpdateOrganizationRequest = z.infer<typeof updateOrganizationRequestSchema>
