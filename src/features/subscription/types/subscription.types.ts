import type { QueryInfo, QueryResult } from '@/types/api'

export interface SubscriptionStatusResponse {
  id: string
  planName: string
  planPrice: number
  currency: string
  billingCycle: string
  startDate: string | null
  endDate: string | null
  status: string
  autoRenew: boolean
  isExpired: boolean
  daysRemaining: number
  pendingPlanName?: string | null
  pendingBillingCycle?: BillingCycle | null
  pendingEffectiveAt?: string | null
  pendingPaymentId?: string | null
  cancelledAt?: string | null
}

export interface SubscriptionEntitlementResponse {
  isOperationalWriteAllowed: boolean
  reason: string
  status: string | null
}

export type PlanFeatureType = 'Boolean' | 'Limit'
export type BillingCycle = 'Monthly' | 'Yearly'

export interface PlanFeatureResponse {
  featureCode: string
  displayName: string
  featureType: PlanFeatureType
  limitValue?: number
  description?: string | null
}

export interface SubscriptionFeatureMetaResponse {
  code: string
  name: string
  type: PlanFeatureType
  description: string
}

export interface SubscriptionPlanResponse {
  id: string
  planName: string
  monthlyPrice: number
  currency: string
  yearlyPrice: number
  yearlyDiscountPercent: number
  displayOrder: number
  features: PlanFeatureResponse[]
  status: string
}

export type SubscriptionApplicationTiming = 'ApplyImmediately' | 'ApplyNextCycle'

export interface InitialSubscriptionSelectionRequestDto {
  planId: string
  billingCycle: BillingCycle
}

export interface InitialSubscriptionSelectionResponse {
  subscriptionStatus: string
  requiresPayment: boolean
  payment?: PaymentLinkResponse | null
}

export interface ChangeSubscriptionPlanRequestDto {
  planId: string
  billingCycle: BillingCycle
  applicationTiming: SubscriptionApplicationTiming
}

export interface SubscriptionPlanChangeResponse {
  applicationTiming: SubscriptionApplicationTiming
  effectiveAt: string | null
  amount: number
  currency: string
  currentUsers: number
  targetUserLimit: number | null
  currentWarehouses: number
  targetWarehouseLimit: number | null
  exceedsTargetLimits: boolean
  requiresPayment: boolean
  payment?: PaymentLinkResponse | null
}

export const PAYMENT_STATUS_VALUES = [
  'Completed',
  'Pending',
  'Failed',
  'Cancelled',
  'Expired',
] as const

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number]

export type PaymentStatusFilter = 'all' | PaymentStatus

export type InvoiceActionKind = 'download' | 'print'

export interface PaymentHistoryFilterState {
  readonly searchText: string
  readonly planId: string
  readonly status: PaymentStatusFilter
  readonly dateFrom?: Date
  readonly dateTo?: Date
}

export interface AppliedPaymentHistoryFilters {
  readonly searchText: string
  readonly planId?: string
  readonly status?: PaymentStatus
  readonly dateFrom?: string
  readonly dateTo?: string
}

export interface PaymentHistoryQuery extends QueryInfo {
  readonly planId?: string
  readonly status?: PaymentStatus
  readonly dateFrom?: string
  readonly dateTo?: string
}

export interface InvoiceDataResponse {
  readonly paymentId: string
  readonly subscriptionId: string
  readonly planId: string | null
  readonly planName: string | null
  readonly invoiceNumber: string
  readonly amount: number
  readonly currency: string
  readonly status: string
  readonly paidAt: string | null
  readonly createdAt: string
  readonly subscriptionStartDate: string | null
  readonly subscriptionEndDate: string | null
}

export interface InvoiceCustomerSnapshot {
  readonly displayName?: string
  readonly email?: string
}

export interface InvoiceActionState {
  readonly paymentId: string
  readonly kind: InvoiceActionKind
}

export interface PlanActionState {
  readonly disabled: boolean
  readonly label: string
  readonly tooltip?: string
}

export interface PaymentResponse {
  id: string
  subscriptionId: string
  planId: string | null
  planName: string | null
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  providerStatus?: string | null
  paidAt: string | null
  createdAt: string
}

export type PaymentHistoryResponse = QueryResult<PaymentResponse>

export interface PaymentLinkResponse {
  readonly checkoutUrl: string
  readonly paymentLinkId: string
  readonly orderCode: number
}

export type PayOSPaymentStatus = 'PAID' | 'PENDING' | 'PROCESSING' | 'CANCELLED' | 'EXPIRED'
