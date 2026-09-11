import { z } from 'zod'
import { nonEmptyDotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const resetTenantUserPermissionsSchema = z.object({
  expectedRoleId: nonEmptyDotNetGuidSchema('Vai trò nhân sự không hợp lệ.'),
})

export type ResetTenantUserPermissionsInput = z.infer<typeof resetTenantUserPermissionsSchema>
