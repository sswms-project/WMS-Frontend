import { z } from 'zod'

export const reportDamagedStockSchema = z.object({
  quantity: z.number().positive('Số lượng hàng hỏng phải lớn hơn 0.'),
  reason: z.string().trim().min(1, 'Lý do báo hỏng là bắt buộc.'),
})

export type ReportDamagedStockFormValues = z.infer<typeof reportDamagedStockSchema>
