import { z } from 'zod'
import { USER_ROLES } from '@/config/roles'
import { sendInvitationSchema } from './invitation.schema'

export const inviteWithWarehouseSchema = sendInvitationSchema
  .extend({
    warehouseId: z.string().uuid('Kho được chọn không hợp lệ').optional(),
  })
  .superRefine((values, context) => {
    if (values.role === USER_ROLES.WarehouseManager && values.warehouseId) {
      context.addIssue({
        code: 'custom',
        path: ['warehouseId'],
        message: 'Quản lý kho phải được phân công bằng luồng gán quản lý',
      })
    }
  })

export type InviteWithWarehouseFormValues = z.infer<typeof inviteWithWarehouseSchema>
