import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { inboundRequestService } from '../services/inbound-request.service'
import type {
  AllowedActionsResponse,
  LookupListResponse,
  LookupQuery,
  PagedResponse,
  ProductOption,
  InboundRequestDetail,
  InboundRequestListQuery,
  InboundRequestSummary,
  SaveInboundRequestRequest,
  SupplierOption,
} from '../types/inbound-request.types'

interface UpdateInboundRequestVariables {
  inboundRequestId: string
  request: SaveInboundRequestRequest
}

interface RejectInboundRequestVariables {
  inboundRequestId: string
  reason: string
}

export function useInboundRequestsQuery(params: InboundRequestListQuery) {
  return useQuery<PagedResponse<InboundRequestSummary>, ApiErrorResponse>({
    queryKey: queryKeys.inboundRequests.list(params),
    queryFn: () =>
      inboundRequestService.getInboundRequests(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useInboundRequestQuery(inboundRequestId: string) {
  return useQuery<InboundRequestDetail, ApiErrorResponse>({
    queryKey: queryKeys.inboundRequests.detail(inboundRequestId),
    queryFn: () =>
      inboundRequestService.getInboundRequest(inboundRequestId).then((response) => response.data),
    enabled: Boolean(inboundRequestId),
  })
}

export function useInboundRequestAllowedActionsQuery(inboundRequestId: string) {
  return useQuery<AllowedActionsResponse, ApiErrorResponse>({
    queryKey: queryKeys.inboundRequests.allowedActions(inboundRequestId),
    queryFn: () =>
      inboundRequestService.getAllowedActions(inboundRequestId).then((response) => response.data),
    enabled: Boolean(inboundRequestId),
  })
}

export function useProductOptionsQuery(params: LookupQuery) {
  return useQuery<LookupListResponse<ProductOption>, ApiErrorResponse>({
    queryKey: queryKeys.inboundRequests.products(params),
    queryFn: () => inboundRequestService.getProducts(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useSupplierOptionsQuery(params: LookupQuery) {
  return useQuery<LookupListResponse<SupplierOption>, ApiErrorResponse>({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => inboundRequestService.getSuppliers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

function useInvalidateInboundRequests() {
  const queryClient = useQueryClient()
  return async (inboundRequestId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.inboundRequests.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceipts.all }),
      ...(inboundRequestId
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.inboundRequests.detail(inboundRequestId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreateInboundRequestMutation() {
  const invalidate = useInvalidateInboundRequests()
  return useMutation<ApiResponse<string>, ApiErrorResponse, SaveInboundRequestRequest>({
    mutationFn: inboundRequestService.createInboundRequest,
    onSuccess: () => invalidate(),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateInboundRequestMutation() {
  const invalidate = useInvalidateInboundRequests()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateInboundRequestVariables>({
    mutationFn: ({ inboundRequestId, request }) =>
      inboundRequestService.updateInboundRequest(inboundRequestId, request),
    onSuccess: (_, variables) => invalidate(variables.inboundRequestId),
    onError: (error) => logger.error(error),
  })
}

export function useSubmitInboundRequestMutation() {
  const invalidate = useInvalidateInboundRequests()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inboundRequestService.submitInboundRequest,
    onSuccess: (_, inboundRequestId) => invalidate(inboundRequestId),
    onError: (error) => logger.error(error),
  })
}

export function useApproveInboundRequestMutation() {
  const invalidate = useInvalidateInboundRequests()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inboundRequestService.approveInboundRequest,
    onSuccess: (_, inboundRequestId) => invalidate(inboundRequestId),
    onError: (error) => logger.error(error),
  })
}

export function useRejectInboundRequestMutation() {
  const invalidate = useInvalidateInboundRequests()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, RejectInboundRequestVariables>({
    mutationFn: ({ inboundRequestId, reason }) =>
      inboundRequestService.rejectInboundRequest(inboundRequestId, reason),
    onSuccess: (_, variables) => invalidate(variables.inboundRequestId),
    onError: (error) => logger.error(error),
  })
}
