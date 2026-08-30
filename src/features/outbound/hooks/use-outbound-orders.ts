import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { outboundService } from '../services/outbound.service'
import type {
  CreateOutboundOrderRequest,
  CustomerListQuery,
  CustomerListResponse,
  IssueStockRequest,
  OutboundOrderListQuery,
  OutboundOrderListResponse,
  RecordReturnRequest,
  ReturnListQuery,
  ReturnListResponse,
} from '../types/outbound.types'

interface IssueStockVariables {
  outboundOrderId: string
  request: IssueStockRequest
}

interface RecordReturnVariables {
  outboundOrderId: string
  request: RecordReturnRequest
}

export function useOutboundOrdersQuery(params: OutboundOrderListQuery, enabled = true) {
  return useQuery<OutboundOrderListResponse, ApiErrorResponse>({
    queryKey: queryKeys.outboundOrders.list(params),
    queryFn: () => outboundService.getOutboundOrders(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useCreateOutboundOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateOutboundOrderRequest>({
    mutationFn: outboundService.createOutboundOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all }),
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

export function useApproveReturnMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: outboundService.approveReturn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.returns.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useCustomerOptionsQuery(params: CustomerListQuery, enabled = true) {
  return useQuery<CustomerListResponse, ApiErrorResponse>({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => outboundService.getCustomers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}
