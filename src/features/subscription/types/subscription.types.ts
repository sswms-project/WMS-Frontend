import type { QueryInfo, QueryResult } from '@/types/api'

export interface SubscriptionStatusResponse {
  id: string
  planName: string
  planPrice: number
  billingCycle: string
  startDate: string
  endDate: string
  status: string
  autoRenew: boolean
  isExpired: boolean
  daysRemaining: number
}

export type PlanFeatureType = 'Boolean' | 'Limit'

export interface PlanFeatureResponse {
  featureCode: string
  displayName: string
  featureType: PlanFeatureType
  limitValue?: number
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
  yearlyPrice: number
  yearlyDiscountPercent: number
  displayOrder: number
  features: PlanFeatureResponse[]
  status: string
}

export interface UpgradeSubscriptionRequestDto {
  newPlanId: string
}

export const PAYMENT_STATUS_VALUES = ['Completed', 'Pending', 'Failed'] as const

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
  status: string
  paidAt: string | null
  createdAt: string
}

export type PaymentHistoryResponse = QueryResult<PaymentResponse>
