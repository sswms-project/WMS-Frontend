import { z } from 'zod'
import { sendInvitationSchema } from './invitation.schema'

export const inviteWithWarehouseSchema = sendInvitationSchema

export type InviteWithWarehouseFormValues = z.infer<typeof inviteWithWarehouseSchema>
