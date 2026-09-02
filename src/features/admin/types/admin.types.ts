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
  currentSubscriberCount: number
  pendingSubscriberCount: number
}

export type TenantStatus = 'Pending' | 'Active' | 'Inactive' | 'Suspended'
export type TenantSubscriptionStatus = 'Active' | 'Expired' | 'Cancelled'
export type SortDirection = 0 | 1

export interface TenantQuery {
  readonly pageNumber: number
  readonly pageSize: number
  readonly search?: string
  readonly status?: TenantStatus
  readonly subscriptionStatus?: TenantSubscriptionStatus
  readonly planId?: string
  readonly sortBy?: 'createdAt' | 'tenantName' | 'status' | 'subscriptionEndDate'
  readonly sortDirection?: SortDirection
}

export interface TenantSummaryResponse {
  readonly id: string
  readonly tenantName: string
  readonly email: string
  readonly phone: string
  readonly address: string | null
  readonly status: TenantStatus
  readonly createdAt: string
  readonly ownerName: string
  readonly ownerEmail: string
  readonly activeUserCount: number
  readonly warehouseCount: number
  readonly subscriptionPlanId: string | null
  readonly subscriptionPlanName: string | null
  readonly subscriptionStatus: TenantSubscriptionStatus | null
  readonly subscriptionEndDate: string | null
}

export interface TenantListResponse {
  readonly items: TenantSummaryResponse[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
}

export interface TenantOwnerResponse {
  readonly id: string
  readonly fullName: string
  readonly email: string
  readonly phone: string | null
  readonly status: string
  readonly lastLoginAt: string | null
}

export interface TenantUsageResponse {
  readonly activeUsers: number
  readonly totalUsers: number
  readonly activeWarehouses: number
  readonly totalWarehouses: number
}

export interface TenantSubscriptionAdminResponse {
  readonly id: string
  readonly planId: string
  readonly planName: string
  readonly billingCycle: string
  readonly startDate: string
  readonly endDate: string
  readonly status: TenantSubscriptionStatus
  readonly autoRenew: boolean
  readonly cancelledAt: string | null
  readonly pendingPlanId: string | null
  readonly pendingPlanName: string | null
  readonly pendingBillingCycle: string | null
}

export interface TenantBillingSummaryResponse {
  readonly totalCompletedRevenue: number
  readonly lastPaymentId: string | null
  readonly lastInvoiceNumber: string | null
  readonly lastPaymentAmount: number | null
  readonly lastPaidAt: string | null
}

export interface TenantDetailsResponse {
  readonly id: string
  readonly tenantName: string
  readonly email: string
  readonly phone: string
  readonly address: string | null
  readonly status: TenantStatus
  readonly createdAt: string
  readonly owner: TenantOwnerResponse
  readonly usage: TenantUsageResponse
  readonly subscription: TenantSubscriptionAdminResponse | null
  readonly billing: TenantBillingSummaryResponse
}

export interface PlatformDashboardResponse {
  readonly tenantSummary: {
    readonly total: number
    readonly active: number
    readonly suspended: number
    readonly pending: number
    readonly inactive: number
    readonly newLast30Days: number
    readonly newThisMonth: number
    readonly newThisYear: number
  }
  readonly subscriptionSummary: {
    readonly active: number
    readonly expired: number
    readonly cancelled: number
  }
  readonly revenueSummary: {
    readonly totalCompleted: number
    readonly thisMonthCompleted: number
    readonly thisYearCompleted: number
  }
  readonly planDistribution: ReadonlyArray<{
    readonly planId: string
    readonly planName: string
    readonly tenantCount: number
  }>
  readonly serviceHealth: ReadonlyArray<{
    readonly service: string
    readonly status: string
    readonly checkedAt: string
    readonly message: string | null
  }>
}

export interface AdminSubscriptionPlanQuery {
  readonly pageNumber: number
  readonly pageSize: number
  readonly search?: string
  readonly status?: SubscriptionPlanStatus
  readonly sortBy?: 'displayOrder' | 'planName' | 'monthlyPrice' | 'status'
  readonly sortDirection?: SortDirection
}

export interface AdminSubscriptionPlanListResponse {
  readonly items: SubscriptionPlanResponse[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
}

export interface TenantStateChangeRequest {
  readonly reason: string
}
