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

export interface SubscriptionPlanResponse {
  id: string
  planName: string
  price: number
  billingCycle: BillingCycle
  maxWarehouses: number
  maxUsers: number
  enableForecasting: boolean
  enableBarcode: boolean
  enableLayoutDesigner: boolean
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
