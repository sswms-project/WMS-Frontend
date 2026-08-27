import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import {
  updateTenantRolePermissionsSchema,
  type UpdateTenantRolePermissionsInput,
} from '../schemas/update-tenant-role-permissions.schema'
import type { TenantRolePermissionWorkspace } from '../types/tenant-access-control.types'

export const tenantAccessControlService = {
  getWorkspace: () =>
    axiosClient
      .get<
        ApiResponse<TenantRolePermissionWorkspace>
      >(API_ENDPOINTS.tenantRolePermissions.workspace)
      .then((response) => response.data),

  assignPermissions: (roleId: string, body: UpdateTenantRolePermissionsInput) => {
    const request = updateTenantRolePermissionsSchema.parse(body)
    return axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.tenantRolePermissions.assign(roleId), request)
      .then((response) => response.data)
  },
}
