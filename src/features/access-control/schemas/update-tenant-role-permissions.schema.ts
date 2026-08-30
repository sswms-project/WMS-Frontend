import { z } from 'zod'

export const updateTenantRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()).default([]),
})

export type UpdateTenantRolePermissionsInput = z.infer<typeof updateTenantRolePermissionsSchema>
