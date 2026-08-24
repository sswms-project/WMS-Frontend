import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { purchaseOrderService } from '../services/purchase-order.service'
import type {
  AllowedActionsResponse,
  LookupListResponse,
  LookupQuery,
  PagedResponse,
  ProductOption,
  PurchaseOrderDetail,
  PurchaseOrderListQuery,
  PurchaseOrderSummary,
  SavePurchaseOrderRequest,
  SupplierOption,
} from '../types/purchase-order.types'

interface UpdatePurchaseOrderVariables {
  purchaseOrderId: string
  request: SavePurchaseOrderRequest
}

interface RejectPurchaseOrderVariables {
  purchaseOrderId: string
  reason: string
}

export function usePurchaseOrdersQuery(params: PurchaseOrderListQuery) {
  return useQuery<PagedResponse<PurchaseOrderSummary>, ApiErrorResponse>({
    queryKey: queryKeys.purchaseOrders.list(params),
    queryFn: () => purchaseOrderService.getPurchaseOrders(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function usePurchaseOrderQuery(purchaseOrderId: string) {
  return useQuery<PurchaseOrderDetail, ApiErrorResponse>({
    queryKey: queryKeys.purchaseOrders.detail(purchaseOrderId),
    queryFn: () =>
      purchaseOrderService.getPurchaseOrder(purchaseOrderId).then((response) => response.data),
    enabled: Boolean(purchaseOrderId),
  })
}

export function usePurchaseOrderAllowedActionsQuery(purchaseOrderId: string) {
  return useQuery<AllowedActionsResponse, ApiErrorResponse>({
    queryKey: queryKeys.purchaseOrders.allowedActions(purchaseOrderId),
    queryFn: () =>
      purchaseOrderService.getAllowedActions(purchaseOrderId).then((response) => response.data),
    enabled: Boolean(purchaseOrderId),
  })
}

export function useProductOptionsQuery(params: LookupQuery) {
  return useQuery<LookupListResponse<ProductOption>, ApiErrorResponse>({
    queryKey: queryKeys.purchaseOrders.products(params),
    queryFn: () => purchaseOrderService.getProducts(params).then((response) => response.data),
  })
}

export function useSupplierOptionsQuery(params: LookupQuery) {
  return useQuery<LookupListResponse<SupplierOption>, ApiErrorResponse>({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => purchaseOrderService.getSuppliers(params).then((response) => response.data),
  })
}

function useInvalidatePurchaseOrders() {
  const queryClient = useQueryClient()
  return async (purchaseOrderId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inboundReceipts.all }),
      ...(purchaseOrderId
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.purchaseOrders.detail(purchaseOrderId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreatePurchaseOrderMutation() {
  const invalidate = useInvalidatePurchaseOrders()
  return useMutation<ApiResponse<string>, ApiErrorResponse, SavePurchaseOrderRequest>({
    mutationFn: purchaseOrderService.createPurchaseOrder,
    onSuccess: () => invalidate(),
    onError: (error) => logger.error(error),
  })
}

export function useUpdatePurchaseOrderMutation() {
  const invalidate = useInvalidatePurchaseOrders()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdatePurchaseOrderVariables>({
    mutationFn: ({ purchaseOrderId, request }) =>
      purchaseOrderService.updatePurchaseOrder(purchaseOrderId, request),
    onSuccess: (_, variables) => invalidate(variables.purchaseOrderId),
    onError: (error) => logger.error(error),
  })
}

export function useSubmitPurchaseOrderMutation() {
  const invalidate = useInvalidatePurchaseOrders()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: purchaseOrderService.submitPurchaseOrder,
    onSuccess: (_, purchaseOrderId) => invalidate(purchaseOrderId),
    onError: (error) => logger.error(error),
  })
}

export function useApprovePurchaseOrderMutation() {
  const invalidate = useInvalidatePurchaseOrders()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: purchaseOrderService.approvePurchaseOrder,
    onSuccess: (_, purchaseOrderId) => invalidate(purchaseOrderId),
    onError: (error) => logger.error(error),
  })
}

export function useRejectPurchaseOrderMutation() {
  const invalidate = useInvalidatePurchaseOrders()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, RejectPurchaseOrderVariables>({
    mutationFn: ({ purchaseOrderId, reason }) =>
      purchaseOrderService.rejectPurchaseOrder(purchaseOrderId, reason),
    onSuccess: (_, variables) => invalidate(variables.purchaseOrderId),
    onError: (error) => logger.error(error),
  })
}
