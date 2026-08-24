import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { SubscriptionFeatureMetaResponse } from '@/features/subscription/types/subscription.types'
import type { ApiResponse } from '@/types/api'
import type {
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '../schemas/subscription-plan.schema'
import type {
  AssignPermissionsRequest,
  PermissionResponse,
  RoleResponse,
  SubscriptionPlanResponse,
} from '../types/admin.types'

export const adminService = {
  getRoles: () => axiosClient.get<ApiResponse<RoleResponse[]>>('/roles').then((r) => r.data),

  getPermissions: () =>
    axiosClient.get<ApiResponse<PermissionResponse[]>>('/permissions').then((r) => r.data),

  assignPermissions: (roleId: string, body: AssignPermissionsRequest) =>
    axiosClient.put<ApiResponse<void>>(`/roles/${roleId}/permissions`, body).then((r) => r.data),

  getSubscriptionPlans: () =>
    axiosClient
      .get<ApiResponse<SubscriptionPlanResponse[]>>(API_ENDPOINTS.subscription.plans)
      .then((r) => r.data),

  getSubscriptionFeatures: () =>
    axiosClient
      .get<
        ApiResponse<SubscriptionFeatureMetaResponse[]>
      >(API_ENDPOINTS.public.subscriptionFeatures)
      .then((r) => r.data),

  createSubscriptionPlan: (body: CreateSubscriptionPlanRequest) =>
    axiosClient
      .post<ApiResponse<SubscriptionPlanResponse>>(API_ENDPOINTS.subscription.plans, body)
      .then((r) => r.data),

  updateSubscriptionPlan: (id: string, body: UpdateSubscriptionPlanRequest) =>
    axiosClient
      .put<ApiResponse<SubscriptionPlanResponse>>(API_ENDPOINTS.subscription.planById(id), body)
      .then((r) => r.data),

  // Backend soft-delete: chuyển Status sang Inactive, trả ApiResponse<Unit> không có data thật.
  deactivateSubscriptionPlan: (id: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.subscription.planById(id))
      .then((r) => r.data),
}
