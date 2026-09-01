import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CreatePaymentLinkRequestDto,
  InvoiceDataResponse,
  PaymentHistoryQuery,
  PaymentHistoryResponse,
  PaymentLinkResponse,
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
  UpgradeSubscriptionRequestDto,
} from '../types/subscription.types'

export const subscriptionService = {
  getCurrentSubscription: () =>
    axiosClient
      .get<ApiResponse<SubscriptionStatusResponse>>(API_ENDPOINTS.subscription.me)
      .then((response) => response.data),

  getSubscriptionPlans: () =>
    axiosClient
      .get<ApiResponse<SubscriptionPlanResponse[]>>(API_ENDPOINTS.subscription.plans)
      .then((response) => response.data),

  getPublicSubscriptionPlans: () =>
    axiosClient
      .get<ApiResponse<SubscriptionPlanResponse[]>>(API_ENDPOINTS.public.subscriptionPlans)
      .then((response) => response.data),

  upgradeSubscription: (body: UpgradeSubscriptionRequestDto) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.subscription.upgrade, body)
      .then((response) => response.data),

  createPaymentLink: (body: CreatePaymentLinkRequestDto) =>
    axiosClient
      .post<ApiResponse<PaymentLinkResponse>>(API_ENDPOINTS.subscription.paymentLink, body)
      .then((response) => response.data),

  syncPaymentStatus: async (orderCode: string): Promise<ApiResponse<string>> => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:7070').replace(
      /\/+$/,
      ''
    )
    const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
    const res = await fetch(`${apiBase}${API_ENDPOINTS.subscription.paymentStatus(orderCode)}`)
    if (!res.ok) throw new Error(`PaymentStatus fetch failed: ${res.status}`)
    return res.json() as Promise<ApiResponse<string>>
  },

  renewSubscription: () =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.subscription.renew)
      .then((response) => response.data),

  cancelSubscription: () =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.subscription.cancel)
      .then((response) => response.data),

  getPaymentHistory: (params: PaymentHistoryQuery) =>
    axiosClient
      .get<ApiResponse<PaymentHistoryResponse>>(API_ENDPOINTS.payments.history, { params })
      .then((response) => response.data),

  getInvoiceData: (paymentId: string) =>
    axiosClient
      .get<ApiResponse<InvoiceDataResponse>>(API_ENDPOINTS.payments.invoiceData(paymentId))
      .then((response) => response.data),

  downloadInvoice: (paymentId: string) =>
    axiosClient
      .get<Blob>(API_ENDPOINTS.payments.invoice(paymentId), { responseType: 'blob' })
      .then((response) => response.data),
}
