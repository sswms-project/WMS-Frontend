import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { deliveryService } from '../services/delivery.service'
import type {
  DeliveryListQuery,
  DeliveryListResponse,
  UpdateDeliveryStatusRequest,
} from '../types/delivery.types'

interface UpdateDeliveryStatusVariables {
  outboundOrderId: string
  request: UpdateDeliveryStatusRequest
}

export function useDeliveriesQuery(params: DeliveryListQuery, enabled = true) {
  return useQuery<DeliveryListResponse, ApiErrorResponse>({
    queryKey: queryKeys.deliveries.list(params),
    queryFn: () => deliveryService.getDeliveries(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useUpdateDeliveryStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateDeliveryStatusVariables>({
    mutationFn: ({ outboundOrderId, request }) =>
      deliveryService.updateDeliveryStatus(outboundOrderId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.outboundOrders.all })
    },
    onError: (error) => logger.error(error),
  })
}
