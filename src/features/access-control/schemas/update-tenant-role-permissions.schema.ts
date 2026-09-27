import { z } from 'zod'
import { nonEmptyDotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const updateTenantRolePermissionsSchema = z.object({
  toAdd: z.array(nonEmptyDotNetGuidSchema('Quyền được chọn không hợp lệ.')).default([]),
  toRemove: z.array(nonEmptyDotNetGuidSchema('Quyền được chọn không hợp lệ.')).default([]),
})

export type UpdateTenantRolePermissionsInput = z.infer<typeof updateTenantRolePermissionsSchema>
