import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse } from '@/types/api'
import { subscriptionService } from '../services/subscription.service'
import type {
  InvoiceDataResponse,
  PaymentHistoryQuery,
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpgradeSubscriptionRequestDto) =>
      subscriptionService.upgradeSubscription(body),
    onSuccess: () => {
      toast.success('Đã cập nhật gói dịch vụ')
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
    },
    onError: (error: ApiErrorResponse) => {
      console.error(error)
      toast.error(error.message ?? 'Không thể cập nhật gói dịch vụ. Vui lòng thử lại.')
    },
  })
}

export function useRenewSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionService.renewSubscription,
    onSuccess: () => {
      toast.success('Đã gia hạn gói dịch vụ')
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
    },
    onError: (error: ApiErrorResponse) => {
      console.error(error)
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
      console.error(error)
      toast.error(error.message ?? 'Không thể hủy gói dịch vụ. Vui lòng thử lại.')
    },
  })
}

export function useInvoiceDataMutation() {
  return useMutation<InvoiceDataResponse, ApiErrorResponse, string>({
    mutationFn: (paymentId) =>
      subscriptionService.getInvoiceData(paymentId).then((response) => response.data),
    onError: (error: ApiErrorResponse) => {
      console.error(error)
      toast.error(error.message ?? 'Không thể tải hóa đơn. Vui lòng thử lại.')
    },
  })
}
