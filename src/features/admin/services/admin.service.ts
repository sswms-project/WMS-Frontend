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
  AdminSubscriptionPlanListResponse,
  AdminSubscriptionPlanQuery,
  PermissionResponse,
  PlatformDashboardResponse,
  RoleResponse,
  TenantDetailsResponse,
  TenantListResponse,
  TenantQuery,
  TenantStateChangeRequest,
} from '../types/admin.types'

export const adminService = {
  getRoles: () => axiosClient.get<ApiResponse<RoleResponse[]>>('/roles').then((r) => r.data),

  getPermissions: () =>
    axiosClient.get<ApiResponse<PermissionResponse[]>>('/permissions').then((r) => r.data),

  assignPermissions: (roleId: string, body: AssignPermissionsRequest) =>
    axiosClient.put<ApiResponse<void>>(`/roles/${roleId}/permissions`, body).then((r) => r.data),

  getSubscriptionPlans: (params: AdminSubscriptionPlanQuery) =>
    axiosClient
      .get<
        ApiResponse<AdminSubscriptionPlanListResponse>
      >(API_ENDPOINTS.platformAdmin.subscriptionPlans, { params })
      .then((r) => r.data.data),

  getPlatformDashboard: () =>
    axiosClient
      .get<ApiResponse<PlatformDashboardResponse>>(API_ENDPOINTS.platformAdmin.dashboard)
      .then((r) => r.data.data),

  getTenants: (params: TenantQuery) =>
    axiosClient
      .get<ApiResponse<TenantListResponse>>(API_ENDPOINTS.platformAdmin.tenants, { params })
      .then((r) => r.data.data),

  getTenant: (tenantId: string) =>
    axiosClient
      .get<ApiResponse<TenantDetailsResponse>>(API_ENDPOINTS.platformAdmin.tenantDetail(tenantId))
      .then((r) => r.data.data),

  suspendTenant: (tenantId: string, body: TenantStateChangeRequest) =>
    axiosClient
      .post<
        ApiResponse<TenantDetailsResponse>
      >(API_ENDPOINTS.platformAdmin.suspendTenant(tenantId), body)
      .then((r) => r.data),

  reactivateTenant: (tenantId: string, body: TenantStateChangeRequest) =>
    axiosClient
      .post<
        ApiResponse<TenantDetailsResponse>
      >(API_ENDPOINTS.platformAdmin.reactivateTenant(tenantId), body)
      .then((r) => r.data),

  getSubscriptionFeatures: () =>
    axiosClient
      .get<
        ApiResponse<SubscriptionFeatureMetaResponse[]>
      >(API_ENDPOINTS.public.subscriptionFeatures)
      .then((r) => r.data),

  createSubscriptionPlan: (body: CreateSubscriptionPlanRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.subscription.plans, body)
      .then((r) => r.data),

  updateSubscriptionPlan: (id: string, body: UpdateSubscriptionPlanRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.subscription.planById(id), body)
      .then((r) => r.data),

  // Backend soft-delete: chuyển Status sang Inactive, trả ApiResponse<Unit> không có data thật.
  deactivateSubscriptionPlan: (id: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.subscription.planById(id))
      .then((r) => r.data),
}
