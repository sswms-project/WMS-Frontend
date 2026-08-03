import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  DownloadInvoiceRequestDto,
  DownloadInvoiceResponseDto,
  PaymentHistoryQuery,
  PaymentHistoryResponse,
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
  UpgradeSubscriptionRequestDto,
} from '../types/subscription.types'

function getFileNameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null

  const fileNameMatch = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(disposition)
  return fileNameMatch?.[1] ? decodeURIComponent(fileNameMatch[1]) : null
}

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
      .post<ApiResponse<SubscriptionStatusResponse>>(API_ENDPOINTS.subscription.upgrade, body)
      .then((response) => response.data),

  renewSubscription: () =>
    axiosClient
      .post<ApiResponse<SubscriptionStatusResponse>>(API_ENDPOINTS.subscription.renew)
      .then((response) => response.data),

  cancelSubscription: () =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.subscription.cancel)
      .then((response) => response.data),

  getPaymentHistory: (params: PaymentHistoryQuery) =>
    axiosClient
      .get<ApiResponse<PaymentHistoryResponse>>(API_ENDPOINTS.payments.history, { params })
      .then((response) => response.data),

  downloadInvoice: async ({
    paymentId,
    fallbackFileName,
  }: DownloadInvoiceRequestDto): Promise<DownloadInvoiceResponseDto> => {
    const response = await axiosClient.get<Blob>(API_ENDPOINTS.payments.invoice(paymentId), {
      responseType: 'blob',
    })
    const fileName =
      getFileNameFromDisposition(response.headers['content-disposition']) ?? fallbackFileName
    return { blob: response.data, fileName }
  },
}
