import { z } from 'zod'
import { DELIVERY_STATUSES } from '../types/delivery.types'

export const updateDeliveryStatusSchema = z
  .object({
    newStatus: z.enum(DELIVERY_STATUSES, { message: 'Vui lòng chọn trạng thái mới.' }),
    note: z.string().trim().max(500, 'Ghi chú không được vượt quá 500 ký tự.'),
    assignedDeliveryStaffId: z.string().nullable(),
  })
  .superRefine((values, context) => {
    if (values.newStatus === 'AssignedToTransport' && !values.assignedDeliveryStaffId) {
      context.addIssue({
        code: 'custom',
        path: ['assignedDeliveryStaffId'],
        message: 'Vui lòng chọn nhân viên giao hàng.',
      })
    }

    if (values.newStatus === 'Failed' && !values.note) {
      context.addIssue({
        code: 'custom',
        path: ['note'],
        message: 'Vui lòng nhập lý do giao hàng thất bại.',
      })
    }
  })

export type UpdateDeliveryStatusFormValues = z.infer<typeof updateDeliveryStatusSchema>
