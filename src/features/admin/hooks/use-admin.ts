import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { SubscriptionFeatureMetaResponse } from '@/features/subscription/types/subscription.types'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import type {
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '../schemas/subscription-plan.schema'
import { adminService } from '../services/admin.service'
import type {
  AdminSubscriptionPlanQuery,
  AssignPermissionsRequest,
  TenantQuery,
  TenantStateChangeRequest,
} from '../types/admin.types'

const KEYS = {
  roles: ['admin', 'roles'] as const,
  permissions: ['admin', 'permissions'] as const,
  subscriptionFeatures: ['admin', 'subscription-features'] as const,
}

export function useRolesQuery() {
  return useQuery({
    queryKey: KEYS.roles,
    queryFn: () => adminService.getRoles().then((r) => r.data),
  })
}

export function usePermissionsQuery() {
  return useQuery({
    queryKey: KEYS.permissions,
    queryFn: () => adminService.getPermissions().then((r) => r.data),
  })
}

export function useAssignPermissionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: AssignPermissionsRequest }) =>
      adminService.assignPermissions(roleId, body),
    onSuccess: () => {
      toast.success('Cập nhật quyền thành công')
      queryClient.invalidateQueries({ queryKey: KEYS.roles })
    },
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Cập nhật quyền thất bại')
    },
  })
}

export interface UpdateSubscriptionPlanVariables {
  id: string
  body: UpdateSubscriptionPlanRequest
}

// Dùng chung query key với feature subscription vì cùng gọi GET /subscription-plans;
// tách key riêng sẽ khiến danh sách gói phía tenant giữ dữ liệu cũ sau khi admin sửa.
export function useAdminSubscriptionPlansQuery(params: AdminSubscriptionPlanQuery) {
  return useQuery({
    queryKey: queryKeys.platformAdmin.plans(params),
    queryFn: () => adminService.getSubscriptionPlans(params),
  })
}

export function usePlatformDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.platformAdmin.dashboard,
    queryFn: adminService.getPlatformDashboard,
  })
}

export function useTenantsQuery(params: TenantQuery) {
  return useQuery({
    queryKey: queryKeys.platformAdmin.tenantList(params),
    queryFn: () => adminService.getTenants(params),
    placeholderData: (previous) => previous,
  })
}

export function useTenantQuery(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.platformAdmin.tenantDetail(tenantId),
    queryFn: () => adminService.getTenant(tenantId),
  })
}

interface TenantStateVariables {
  readonly tenantId: string
  readonly body: TenantStateChangeRequest
}

function useTenantStateMutation(action: 'suspend' | 'reactivate') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tenantId, body }: TenantStateVariables) =>
      action === 'suspend'
        ? adminService.suspendTenant(tenantId, body)
        : adminService.reactivateTenant(tenantId, body),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        queryKeys.platformAdmin.tenantDetail(variables.tenantId),
        response.data
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.tenants })
      queryClient.invalidateQueries({
        queryKey: queryKeys.platformAdmin.tenantDetail(variables.tenantId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.dashboard })
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all })
      toast.success(action === 'suspend' ? 'Đã tạm ngưng tenant.' : 'Đã kích hoạt lại tenant.')
    },
    onError: (error: ApiErrorResponse, variables) => {
      logger.error(error)
      if (error.statusCode === 409) {
        queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.tenants })
        queryClient.invalidateQueries({
          queryKey: queryKeys.platformAdmin.tenantDetail(variables.tenantId),
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.dashboard })
      }
      toast.error(error.message || 'Không thể cập nhật trạng thái tenant.')
    },
  })
}

export function useSuspendTenantMutation() {
  return useTenantStateMutation('suspend')
}

export function useReactivateTenantMutation() {
  return useTenantStateMutation('reactivate')
}

export function useSubscriptionFeaturesQuery() {
  return useQuery<SubscriptionFeatureMetaResponse[], ApiErrorResponse>({
    queryKey: KEYS.subscriptionFeatures,
    queryFn: () => adminService.getSubscriptionFeatures().then((r) => r.data),
    staleTime: 10 * 60 * 1000, // feature list thay đổi rất ít
  })
}

// Create/Update chỉ log lỗi ở hook — page orchestrator phân loại lỗi field và toast,
// nên hiển thị toast thêm tại đây sẽ gây trùng thông báo.
export function useCreateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateSubscriptionPlanRequest>({
    mutationFn: adminService.createSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useUpdateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateSubscriptionPlanVariables>({
    mutationFn: ({ id, body }) => adminService.updateSubscriptionPlan(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useDeactivateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: adminService.deactivateSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.platformAdmin.all })
    },
    onError: (error) => logger.error(error),
  })
}
