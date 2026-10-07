import type { SubscriptionPlanResponse as SubscriptionPlanApiResponse } from '@/features/subscription/types/subscription.types'
import type { PermissionDeltaInput } from '@/lib/permission-delta.schema'

export interface RoleResponse {
  id: string
  roleName: string
  description: string | null
  isSystemRole: boolean
  parentRoleId: string | null
  permissions: PermissionResponse[]
}

export interface PermissionResponse {
  id: string
  permissionKey: string
  module: string
  displayName: string
  moduleDisplayName: string
  description: string | null
  category: string
  categoryDisplayName: string
  categoryDescription: string
  categoryOrder: number
  moduleOrder: number
  scope: PermissionScope
}

export type PermissionScope =
  | 'Unclassified'
  | 'PlatformOnly'
  | 'TenantOwnerDefault'
  | 'TenantDelegatable'

export interface AdminPermissionModuleGroup {
  readonly module: string
  readonly moduleDisplayName: string
  readonly moduleOrder: number
  readonly permissions: PermissionResponse[]
}

export interface AdminPermissionCategoryGroup {
  readonly category: string
  readonly categoryDisplayName: string
  readonly categoryDescription: string
  readonly categoryOrder: number
  readonly modules: AdminPermissionModuleGroup[]
}

export type AssignPermissionsRequest = PermissionDeltaInput

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

export interface AdminPaymentQuery {
  readonly pageNumber: number
  readonly pageSize: number
  readonly search?: string
  readonly status?: string
  readonly tenantId?: string
  readonly planId?: string
  readonly dateFrom?: string
  readonly dateTo?: string
  readonly sortBy?: 'createdAt' | 'paidAt' | 'amount' | 'status'
  readonly sortDirection?: SortDirection
}

export interface AdminPaymentResponse {
  readonly id: string
  readonly tenantId: string | null
  readonly tenantName: string | null
  readonly invoiceNumber: string
  readonly planName: string | null
  readonly billingCycle: string | null
  readonly type: string
  readonly amount: number
  readonly currency: string
  readonly status: string
  readonly providerStatus: string | null
  readonly payOSOrderCode: number | null
  readonly paidAt: string | null
  readonly createdAt: string
}

export interface AdminPaymentListResponse {
  readonly items: readonly AdminPaymentResponse[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
  readonly totalCompletedAmount: number
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
  readonly ownerEmailVerified: boolean
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
  readonly emailVerified: boolean
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
  readonly concurrencyToken: string
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
  // Optional so the dashboard keeps rendering against API builds that predate these fields.
  readonly userSummary?: {
    readonly total: number
    readonly active: number
    readonly newLast30Days: number
  }
  readonly revenueTrend?: ReadonlyArray<{
    readonly year: number
    readonly month: number
    readonly revenue: number
    readonly paymentCount: number
  }>
  readonly recentTenants?: ReadonlyArray<{
    readonly tenantId: string
    readonly tenantName: string
    readonly email: string
    readonly status: string
    readonly createdAt: string
  }>
  readonly recentPayments?: ReadonlyArray<{
    readonly paymentId: string
    readonly tenantId: string | null
    readonly tenantName: string | null
    readonly invoiceNumber: string
    readonly amount: number
    readonly planName: string | null
    readonly paidAt: string
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

export interface SendAnnouncementRequest {
  readonly title: string
  readonly message: string
  readonly audience: 'AllActiveTenants' | 'ByPlan' | 'SpecificTenants'
  readonly planIds: string[] | null
  readonly tenantIds: string[] | null
  readonly sendEmail: boolean
  readonly action?: string | null
}

export interface SendAnnouncementResponse {
  readonly recipientCount: number
  readonly emailQueuedCount: number
}

export interface AnnouncementHistoryQuery {
  readonly pageNumber: number
  readonly pageSize: number
}

export interface AnnouncementHistoryItem {
  readonly id: string
  readonly title: string
  readonly message: string
  readonly audience: 'AllActiveTenants' | 'ByPlan' | 'SpecificTenants'
  readonly action: string | null
  readonly recipientCount: number
  readonly sendEmail: boolean
  readonly emailSentCount: number
  readonly emailPendingCount: number
  readonly emailFailedCount: number
  readonly createdAt: string
}

export interface AnnouncementHistoryListResponse {
  readonly items: AnnouncementHistoryItem[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
}

export interface TenantStateChangeRequest {
  readonly reason: string
}

export interface ApproveTenantRegistrationRequest {
  readonly concurrencyToken: string
}

export interface RejectTenantRegistrationRequest {
  readonly concurrencyToken: string
  readonly reason: string
}
