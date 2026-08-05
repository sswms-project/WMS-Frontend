import type { SubscriptionPlanResponse as SubscriptionPlanApiResponse } from '@/features/subscription/types/subscription.types'
import type { SubscriptionPlanFormOutput } from '../schemas/subscription-plan.schema'

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

// Dẫn xuất từ DTO dùng chung của feature subscription để không có hai kiểu cùng mô tả
// một response; chỉ thu hẹp hai field enum mà backend serialize thành chuỗi, để màn
// quản trị so khớp trạng thái/chu kỳ an toàn.
export interface SubscriptionPlanResponse extends Omit<
  SubscriptionPlanApiResponse,
  'billingCycle' | 'status'
> {
  billingCycle: SubscriptionPlanFormOutput['billingCycle']
  status: SubscriptionPlanStatus
}
