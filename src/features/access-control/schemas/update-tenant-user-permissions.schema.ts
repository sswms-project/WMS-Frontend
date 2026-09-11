import { z } from 'zod'
import { nonEmptyDotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const updateTenantUserPermissionsSchema = z.object({
  expectedRoleId: nonEmptyDotNetGuidSchema('Vai trò nhân sự không hợp lệ.'),
  permissionIds: z.array(nonEmptyDotNetGuidSchema('Quyền được chọn không hợp lệ.')),
})

export type UpdateTenantUserPermissionsInput = z.infer<typeof updateTenantUserPermissionsSchema>
