import { z } from 'zod'

export const tenantStateSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do thay đổi trạng thái.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.'),
})

export type TenantStateFormValues = z.infer<typeof tenantStateSchema>
