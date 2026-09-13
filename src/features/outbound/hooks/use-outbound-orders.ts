import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { outboundService } from '../services/outbound.service'
import type {
  CreateOutboundOrderRequest,
  IssueStockRequest,
  OutboundOrderListQuery,
  OutboundOrderListResponse,
  OutboundOrderSummary,
  RecordReturnRequest,
  RejectReturnRequest,
  ReturnListQuery,
  ReturnListResponse,
  ReturnSummary,
} from '../types/outbound.types'
import type {
  CustomerListQuery,
  CustomerListResponse,
} from '@/features/customer/types/customer.types'
import { customerService } from '@/features/customer/services/customer.service'

interface IssueStockVariables {
  outboundOrderId: string
  request: IssueStockRequest
}

interface RecordReturnVariables {
  outboundOrderId: string
  request: RecordReturnRequest
}

interface RejectReturnVariables {
  returnId: string
  request: RejectReturnRequest
}

export function useOutboundOrdersQuery(params: OutboundOrderListQuery, enabled = true) {
  return useQuery<OutboundOrderListResponse, ApiErrorResponse>({
    queryKey: queryKeys.outboundOrders.list(params),
    queryFn: () => outboundService.getOutboundOrders(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useOutboundOrderQuery(outboundOrderId: string | null) {
  return useQuery<OutboundOrderSummary, ApiErrorResponse>({
    queryKey: queryKeys.outboundOrders.detail(outboundOrderId ?? ''),
    queryFn: () =>
      outboundService.getOutboundOrder(outboundOrderId ?? '').then((response) => response.data),
    enabled: Boolean(outboundOrderId),
  })
}

export function useCreateOutboundOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateOutboundOrderRequest>({
    mutationFn: outboundService.createOutboundOrder,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
      ]),
    onError: (error) => logger.error(error),
  })
}

export function useIssueStockMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, IssueStockVariables>({
    mutationFn: ({ outboundOrderId, request }) =>
      outboundService.issueStock(outboundOrderId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useRecordReturnMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, RecordReturnVariables>({
    mutationFn: ({ outboundOrderId, request }) =>
      outboundService.recordReturn(outboundOrderId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.returns.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useReturnsQuery(params: ReturnListQuery, enabled = true) {
  return useQuery<ReturnListResponse, ApiErrorResponse>({
    queryKey: queryKeys.returns.list(params),
    queryFn: () => outboundService.getReturns(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useReturnQuery(returnId: string | null) {
  return useQuery<ReturnSummary, ApiErrorResponse>({
    queryKey: queryKeys.returns.detail(returnId ?? ''),
    queryFn: () => outboundService.getReturn(returnId ?? '').then((response) => response.data),
    enabled: Boolean(returnId),
  })
}

export function useApproveReturnMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: outboundService.approveReturn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.returns.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useRejectReturnMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, RejectReturnVariables>({
    mutationFn: ({ returnId, request }) => outboundService.rejectReturn(returnId, request),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.returns.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all }),
      ]),
    onError: (error) => logger.error(error),
  })
}

export function useCustomerOptionsQuery(params: CustomerListQuery, enabled = true) {
  return useQuery<CustomerListResponse, ApiErrorResponse>({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customerService.getCustomers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}
