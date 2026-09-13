import { z } from 'zod'

export const rejectReturnSchema = z.object({
  reason: z.string().trim().min(1, 'Vui lòng nhập lý do từ chối.').max(500),
})

export type RejectReturnFormValues = z.infer<typeof rejectReturnSchema>
