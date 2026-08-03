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

export interface SubscriptionPlanResponse {
  id: string
  planName: string
  price: number
  billingCycle: string
  maxWarehouses: number
  maxUsers: number
  enableForecasting: boolean
  enableBarcode: boolean
  enableLayoutDesigner: boolean
  status: string
}

export interface UpgradeSubscriptionRequestDto {
  newPlanId: string
}

export interface PaymentResponse {
  id: string
  subscriptionId: string
  invoiceNumber: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
}

export interface DownloadInvoiceRequestDto {
  paymentId: string
  fallbackFileName: string
}

export interface DownloadInvoiceResponseDto {
  blob: Blob
  fileName: string
}

export type PaymentHistoryQuery = QueryInfo

export type PaymentHistoryResponse = QueryResult<PaymentResponse>
