import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import {
  resetTenantUserPermissionsSchema,
  type ResetTenantUserPermissionsInput,
} from '../schemas/reset-tenant-user-permissions.schema'
import {
  updateTenantUserPermissionsSchema,
  type UpdateTenantUserPermissionsInput,
} from '../schemas/update-tenant-user-permissions.schema'
import {
  updateTenantRolePermissionsSchema,
  type UpdateTenantRolePermissionsInput,
} from '../schemas/update-tenant-role-permissions.schema'
import type {
  TenantRolePermissionWorkspace,
  TenantUserPermissionSubject,
  TenantUserPermissionSubjectQuery,
  TenantUserPermissionWorkspace,
} from '../types/tenant-access-control.types'

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

  getSubjects: (params: TenantUserPermissionSubjectQuery) =>
    axiosClient
      .get<
        ApiResponse<QueryResult<TenantUserPermissionSubject>>
      >(API_ENDPOINTS.tenantUserPermissions.subjects, { params })
      .then((response) => response.data),

  getUserWorkspace: (userId: string) =>
    axiosClient
      .get<
        ApiResponse<TenantUserPermissionWorkspace>
      >(API_ENDPOINTS.tenantUserPermissions.detail(userId))
      .then((response) => response.data),

  assignUserPermissions: (userId: string, body: UpdateTenantUserPermissionsInput) => {
    const request = updateTenantUserPermissionsSchema.parse(body)
    return axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.tenantUserPermissions.assign(userId), request)
      .then((response) => response.data)
  },

  resetUserPermissions: (userId: string, body: ResetTenantUserPermissionsInput) => {
    const request = resetTenantUserPermissionsSchema.parse(body)
    return axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.tenantUserPermissions.reset(userId), request)
      .then((response) => response.data)
  },
}
