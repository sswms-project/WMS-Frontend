import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  DeliveryListQuery,
  DeliveryListResponse,
  UpdateDeliveryStatusRequest,
} from '../types/delivery.types'

export const deliveryService = {
  getDeliveries: (params: DeliveryListQuery) =>
    axiosClient
      .get<ApiResponse<DeliveryListResponse>>(API_ENDPOINTS.deliveries.list, { params })
      .then((response) => response.data),

  updateDeliveryStatus: (outboundOrderId: string, request: UpdateDeliveryStatusRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.deliveries.updateStatus(outboundOrderId), request)
      .then((response) => response.data),
}
