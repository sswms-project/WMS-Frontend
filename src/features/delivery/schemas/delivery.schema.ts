import { z } from 'zod'
import { DELIVERY_STATUSES } from '../types/delivery.types'

export const updateDeliveryStatusSchema = z.object({
  newStatus: z.enum(DELIVERY_STATUSES, { message: 'Vui lòng chọn trạng thái mới.' }),
  note: z.string().trim().max(500, 'Ghi chú không được vượt quá 500 ký tự.'),
})

export type UpdateDeliveryStatusFormValues = z.infer<typeof updateDeliveryStatusSchema>
