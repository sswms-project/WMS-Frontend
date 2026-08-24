import { z } from 'zod'
import { INVITABLE_ROLES } from './invitation.schema'
import { dotNetGuidSchema } from './dotnet-guid.schema'

export const inviteWithWarehouseSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(320, 'Email không được vượt quá 320 ký tự'),
  role: z.enum(INVITABLE_ROLES),
  warehouseId: dotNetGuidSchema('Kho không hợp lệ').optional(),
})

export type InviteWithWarehouseFormValues = z.infer<typeof inviteWithWarehouseSchema>
