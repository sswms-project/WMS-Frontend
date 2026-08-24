import type { SubscriptionPlanResponse as SubscriptionPlanApiResponse } from '@/features/subscription/types/subscription.types'

export interface RoleResponse {
  id: string
  roleName: string
  isSystemRole: boolean
  parentRoleId: string | null
  permissions: PermissionResponse[]
}

export interface PermissionResponse {
  id: string
  permissionKey: string
  module: string
}

export interface AssignPermissionsRequest {
  permissionIds: string[]
}

export type SubscriptionPlanStatus = 'Active' | 'Inactive'

// Dẫn xuất từ DTO dùng chung; thu hẹp status enum để màn quản trị so khớp an toàn.
export interface SubscriptionPlanResponse extends Omit<SubscriptionPlanApiResponse, 'status'> {
  status: SubscriptionPlanStatus
}
