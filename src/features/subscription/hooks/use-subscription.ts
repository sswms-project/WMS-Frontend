import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse } from '@/types/api'
import { subscriptionService } from '../services/subscription.service'
import type {
  CreatePaymentLinkRequestDto,
  InvoiceDataResponse,
  PaymentHistoryQuery,
  PaymentLinkResponse,
  UpgradeSubscriptionRequestDto,
} from '../types/subscription.types'

export function useCurrentSubscriptionQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.subscription.me,
    queryFn: () => subscriptionService.getCurrentSubscription().then((response) => response.data),
    enabled,
  })
}

export function useSubscriptionPlansQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.subscription.plans,
    queryFn: () => subscriptionService.getSubscriptionPlans().then((response) => response.data),
    enabled,
  })
}

export function usePublicSubscriptionPlansQuery() {
  return useQuery({
    queryKey: queryKeys.subscription.publicPlans,
    queryFn: () =>
      subscriptionService.getPublicSubscriptionPlans().then((response) => response.data),
  })
}

export function usePaymentHistoryQuery(params: PaymentHistoryQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => subscriptionService.getPaymentHistory(params).then((response) => response.data),
    enabled,
  })
}

export function useInvoiceDataQuery(paymentId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.invoiceData(paymentId),
    queryFn: () => subscriptionService.getInvoiceData(paymentId).then((response) => response.data),
    enabled,
  })
}

export function useUpgradeSubscriptionMutation() {
  return useMutation<PaymentLinkResponse, ApiErrorResponse, UpgradeSubscriptionRequestDto>({
    mutationFn: (body: UpgradeSubscriptionRequestDto) =>
      subscriptionService.upgradeSubscription(body).then((response) => response.data),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Không thể cập nhật gói dịch vụ. Vui lòng thử lại.')
    },
  })
}

export function useRenewSubscriptionMutation() {
  return useMutation<PaymentLinkResponse, ApiErrorResponse>({
    mutationFn: () => subscriptionService.renewSubscription().then((response) => response.data),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Không thể gia hạn gói dịch vụ. Vui lòng thử lại.')
    },
  })
}

export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      toast.success('Đã hủy gói dịch vụ')
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me })
    },
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Không thể hủy gói dịch vụ. Vui lòng thử lại.')
    },
  })
}

export function useInvoiceDataMutation() {
  return useMutation<InvoiceDataResponse, ApiErrorResponse, string>({
    mutationFn: (paymentId) =>
      subscriptionService.getInvoiceData(paymentId).then((response) => response.data),
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Không thể tải hóa đơn. Vui lòng thử lại.')
    },
  })
}

export function useSyncPaymentStatusQuery(orderCode: string | null) {
  return useQuery({
    queryKey: ['payment-status', orderCode],
    queryFn: () =>
      subscriptionService.syncPaymentStatus(orderCode!).then((response) => response.data),
    enabled: Boolean(orderCode),
    retry: 3,
    refetchInterval: (query) => {
      const status = query.state.data
      if (status === 'Completed' || status === 'Failed') return false
      return 3000
    },
  })
}

export function useCreatePaymentLinkMutation() {
  return useMutation<PaymentLinkResponse, ApiErrorResponse, CreatePaymentLinkRequestDto>({
    mutationFn: (body) =>
      subscriptionService.createPaymentLink(body).then((response) => response.data),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Không thể tạo link thanh toán. Vui lòng thử lại.')
    },
  })
}

export function useInvoiceDownloadMutation() {
  return useMutation<Blob, ApiErrorResponse, string>({
    mutationFn: subscriptionService.downloadInvoice,
    onError: (error: ApiErrorResponse) => {
      logger.error(error)
      toast.error(error.message ?? 'Không thể tải hóa đơn. Vui lòng thử lại.')
    },
  })
}
