import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  ChangeSubscriptionPlanRequestDto,
  InitialSubscriptionSelectionRequestDto,
  InitialSubscriptionSelectionResponse,
  InvoiceDataResponse,
  PaymentHistoryQuery,
  PaymentHistoryResponse,
  PaymentLinkResponse,
  SubscriptionPlanChangeResponse,
  SubscriptionPlanResponse,
  SubscriptionEntitlementResponse,
  SubscriptionStatusResponse,
} from '../types/subscription.types'

export const subscriptionService = {
  getCurrentSubscription: () =>
    axiosClient
      .get<ApiResponse<SubscriptionStatusResponse | null>>(API_ENDPOINTS.subscription.me)
      .then((response) => response.data),

  getSubscriptionPlans: () =>
    axiosClient
      .get<ApiResponse<SubscriptionPlanResponse[]>>(API_ENDPOINTS.subscription.plans)
      .then((response) => response.data),

  getPublicSubscriptionPlans: () =>
    axiosClient
      .get<ApiResponse<SubscriptionPlanResponse[]>>(API_ENDPOINTS.public.subscriptionPlans)
      .then((response) => response.data),

  selectInitialPlan: (body: InitialSubscriptionSelectionRequestDto) =>
    axiosClient
      .post<
        ApiResponse<InitialSubscriptionSelectionResponse>
      >(API_ENDPOINTS.subscription.initialSelection, body)
      .then((response) => response.data),

  getEntitlement: () =>
    axiosClient
      .get<ApiResponse<SubscriptionEntitlementResponse>>(API_ENDPOINTS.subscription.entitlement)
      .then((response) => response.data),

  changePlan: (body: ChangeSubscriptionPlanRequestDto) =>
    axiosClient
      .post<
        ApiResponse<SubscriptionPlanChangeResponse>
      >(API_ENDPOINTS.subscription.changePlan, body)
      .then((response) => response.data),

  syncPaymentStatus: (orderCode: string) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.subscription.paymentStatus(orderCode))
      .then((response) => response.data),

  renewSubscription: () =>
    axiosClient
      .post<ApiResponse<PaymentLinkResponse>>(API_ENDPOINTS.subscription.renew)
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
