import { permissionDeltaSchema } from '@/lib/permission-delta.schema'
import type { PermissionDeltaInput } from '@/lib/permission-delta.schema'

export const updateTenantRolePermissionsSchema = permissionDeltaSchema

export type UpdateTenantRolePermissionsInput = PermissionDeltaInput
