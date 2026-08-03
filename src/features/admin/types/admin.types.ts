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

export type BillingCycle = 'Monthly' | 'Yearly'

export type SubscriptionPlanStatus = 'Active' | 'Inactive'

// Dẫn xuất từ DTO dùng chung của feature subscription để không có hai kiểu cùng mô tả
// một response; chỉ thu hẹp hai field enum mà backend serialize thành chuỗi, để màn
// quản trị so khớp trạng thái/chu kỳ an toàn.
export interface SubscriptionPlanResponse extends Omit<
  SubscriptionPlanApiResponse,
  'billingCycle' | 'status'
> {
  billingCycle: BillingCycle
  status: SubscriptionPlanStatus
}

export interface CreateSubscriptionPlanRequest {
  planName: string
  price: number
  billingCycle: BillingCycle
  maxWarehouses: number
  maxUsers: number
  enableForecasting: boolean
  enableBarcode: boolean
  enableLayoutDesigner: boolean
}

// Không dùng Partial<CreateSubscriptionPlanRequest>: backend UpdateSubscriptionPlanCommand
// không nhận billingCycle, nên Partial<> sẽ âm thầm cho phép gửi field bị bỏ qua.
export interface UpdateSubscriptionPlanRequest {
  planName?: string
  price?: number
  maxWarehouses?: number
  maxUsers?: number
  enableForecasting?: boolean
  enableBarcode?: boolean
  enableLayoutDesigner?: boolean
  status?: SubscriptionPlanStatus
}
