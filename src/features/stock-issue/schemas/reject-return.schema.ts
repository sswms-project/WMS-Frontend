import { z } from 'zod'

export const rejectGoodsReturnRequestSchema = z.object({
  reason: z.string().trim().min(1, 'Vui lòng nhập lý do từ chối.').max(500),
})

export type RejectGoodsReturnRequestFormValues = z.infer<typeof rejectGoodsReturnRequestSchema>
