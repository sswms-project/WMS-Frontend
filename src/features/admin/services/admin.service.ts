import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  AssignPermissionsRequest,
  CreateSubscriptionPlanRequest,
  PermissionResponse,
  RoleResponse,
  SubscriptionPlanResponse,
  UpdateSubscriptionPlanRequest,
} from '../types/admin.types'

export const adminService = {
  getRoles: () => axiosClient.get<ApiResponse<RoleResponse[]>>('/roles').then((r) => r.data),

  getPermissions: () =>
    axiosClient.get<ApiResponse<PermissionResponse[]>>('/permissions').then((r) => r.data),

  assignPermissions: (roleId: string, body: AssignPermissionsRequest) =>
    axiosClient.put<ApiResponse<void>>(`/roles/${roleId}/permissions`, body).then((r) => r.data),

  getSubscriptionPlans: () =>
    axiosClient
      .get<ApiResponse<SubscriptionPlanResponse[]>>(API_ENDPOINTS.subscriptionPlans.root)
      .then((r) => r.data),

  createSubscriptionPlan: (body: CreateSubscriptionPlanRequest) =>
    axiosClient
      .post<ApiResponse<SubscriptionPlanResponse>>(API_ENDPOINTS.subscriptionPlans.root, body)
      .then((r) => r.data),

  updateSubscriptionPlan: (id: string, body: UpdateSubscriptionPlanRequest) =>
    axiosClient
      .put<ApiResponse<SubscriptionPlanResponse>>(API_ENDPOINTS.subscriptionPlans.byId(id), body)
      .then((r) => r.data),

  // Backend soft-delete: chuyển Status sang Inactive, trả ApiResponse<Unit> không có data thật.
  deactivateSubscriptionPlan: (id: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.subscriptionPlans.byId(id))
      .then((r) => r.data),
}
