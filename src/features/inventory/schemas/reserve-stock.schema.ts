import { z } from 'zod'

export const reserveStockSchema = z.object({
  quantity: z.coerce.number().positive('Số lượng cần giữ phải lớn hơn 0.'),
})

export type ReserveStockFormValues = z.infer<typeof reserveStockSchema>
