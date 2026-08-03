import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { adminService } from '../services/admin.service'
import type {
  AssignPermissionsRequest,
  CreateSubscriptionPlanRequest,
  SubscriptionPlanResponse,
  UpdateSubscriptionPlanRequest,
} from '../types/admin.types'

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
      console.error(error)
      toast.error(error.message ?? 'Cập nhật quyền thất bại')
    },
  })
}

export interface UpdateSubscriptionPlanVariables {
  id: string
  body: UpdateSubscriptionPlanRequest
}

export function useSubscriptionPlansQuery() {
  return useQuery<SubscriptionPlanResponse[], ApiErrorResponse>({
    queryKey: queryKeys.subscriptionPlans.all,
    queryFn: () => adminService.getSubscriptionPlans().then((r) => r.data),
  })
}

// Create/Update chỉ log lỗi ở hook — dialog tự phân loại (trùng tên → lỗi inline tại
// field, lỗi validation → inline theo từng field, còn lại → toast) và cần giữ dialog
// mở khi lỗi, nên toast ở đây sẽ gây hiển thị trùng.
export function useCreateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<SubscriptionPlanResponse>,
    ApiErrorResponse,
    CreateSubscriptionPlanRequest
  >({
    mutationFn: adminService.createSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans.all })
    },
    onError: (error) => console.error(error),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans.all })
    },
    onError: (error) => console.error(error),
  })
}

export function useDeactivateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: adminService.deactivateSubscriptionPlan,
    onSuccess: () => {
      toast.success('Đã vô hiệu hóa gói đăng ký.')
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans.all })
    },
    onError: (error) => console.error(error),
  })
}
