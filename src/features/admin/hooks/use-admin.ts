import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import type {
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '../schemas/subscription-plan.schema'
import { adminService } from '../services/admin.service'
import type { AssignPermissionsRequest, SubscriptionPlanResponse } from '../types/admin.types'

const KEYS = {
  roles: ['admin', 'roles'] as const,
  permissions: ['admin', 'permissions'] as const,
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
export function useAdminSubscriptionPlansQuery() {
  return useQuery<SubscriptionPlanResponse[], ApiErrorResponse>({
    queryKey: queryKeys.subscription.plans,
    queryFn: () => adminService.getSubscriptionPlans().then((r) => r.data),
  })
}

// Create/Update chỉ log lỗi ở hook — page orchestrator phân loại lỗi field và toast,
// nên hiển thị toast thêm tại đây sẽ gây trùng thông báo.
export function useCreateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<SubscriptionPlanResponse>,
    ApiErrorResponse,
    CreateSubscriptionPlanRequest
  >({
    mutationFn: adminService.createSubscriptionPlan,
    onSuccess: () => {
      // Invalidate cả nhánh 'subscription' để danh sách gói phía tenant và trang
      // bảng giá công khai cũng lấy lại dữ liệu mới.
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useUpdateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<SubscriptionPlanResponse>,
    ApiErrorResponse,
    UpdateSubscriptionPlanVariables
  >({
    mutationFn: ({ id, body }) => adminService.updateSubscriptionPlan(id, body),
    onSuccess: () => {
      // Invalidate cả nhánh 'subscription' để danh sách gói phía tenant và trang
      // bảng giá công khai cũng lấy lại dữ liệu mới.
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useDeactivateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: adminService.deactivateSubscriptionPlan,
    onSuccess: () => {
      // Invalidate cả nhánh 'subscription' để danh sách gói phía tenant và trang
      // bảng giá công khai cũng lấy lại dữ liệu mới.
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
    },
    onError: (error) => logger.error(error),
  })
}
