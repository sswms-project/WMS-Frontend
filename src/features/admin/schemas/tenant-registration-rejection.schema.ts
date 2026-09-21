import { z } from 'zod'

export const tenantRegistrationRejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do từ chối.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.'),
})

export type TenantRegistrationRejectionFormValues = z.infer<
  typeof tenantRegistrationRejectionSchema
>
