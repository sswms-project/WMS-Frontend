import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  AllowedActionsResponse,
  CreateCycleCountRequest,
  CreateStockAdjustmentRequest,
  CycleCountDetail,
  CycleCountListQuery,
  CycleCountListResponse,
  RejectStockAdjustmentRequest,
  RequestRecountRequest,
  StockAdjustment,
  StockAdjustmentListQuery,
  StockAdjustmentListResponse,
} from '../types/cycle-count.types'

export const cycleCountService = {
  getCycleCounts: (params: CycleCountListQuery) =>
    axiosClient
      .get<ApiResponse<CycleCountListResponse>>(API_ENDPOINTS.cycleCounts.list, { params })
      .then((response) => response.data),
  getCycleCount: (cycleCountId: string) =>
    axiosClient
      .get<ApiResponse<CycleCountDetail>>(API_ENDPOINTS.cycleCounts.detail(cycleCountId))
      .then((response) => response.data),
  getCycleCountAllowedActions: (cycleCountId: string) =>
    axiosClient
      .get<
        ApiResponse<AllowedActionsResponse>
      >(API_ENDPOINTS.cycleCounts.allowedActions(cycleCountId))
      .then((response) => response.data),
  createCycleCount: (request: CreateCycleCountRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.cycleCounts.create, request)
      .then((response) => response.data),
  recordCycleCountItem: ({
    cycleCountId,
    itemId,
    countedQuantity,
  }: {
    cycleCountId: string
    itemId: string
    countedQuantity: number
  }) =>
    axiosClient
      .put<
        ApiResponse<unknown>
      >(API_ENDPOINTS.cycleCounts.recordItem(cycleCountId, itemId), countedQuantity)
      .then((response) => response.data),
  submitCycleCount: (cycleCountId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.cycleCounts.submit(cycleCountId))
      .then((response) => response.data),
  requestRecount: ({
    cycleCountId,
    request,
  }: {
    cycleCountId: string
    request: RequestRecountRequest
  }) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.cycleCounts.recount(cycleCountId), request)
      .then((response) => response.data),
  finalizeCycleCount: (cycleCountId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.cycleCounts.finalize(cycleCountId))
      .then((response) => response.data),
  getStockAdjustments: (params: StockAdjustmentListQuery) =>
    axiosClient
      .get<ApiResponse<StockAdjustmentListResponse>>(API_ENDPOINTS.stockAdjustments.list, {
        params,
      })
      .then((response) => response.data),
  getStockAdjustment: (adjustmentId: string) =>
    axiosClient
      .get<ApiResponse<StockAdjustment>>(API_ENDPOINTS.stockAdjustments.detail(adjustmentId))
      .then((response) => response.data),
  getStockAdjustmentAllowedActions: (adjustmentId: string) =>
    axiosClient
      .get<
        ApiResponse<AllowedActionsResponse>
      >(API_ENDPOINTS.stockAdjustments.allowedActions(adjustmentId))
      .then((response) => response.data),
  createStockAdjustment: (request: CreateStockAdjustmentRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.stockAdjustments.create, request)
      .then((response) => response.data),
  approveStockAdjustment: (adjustmentId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.stockAdjustments.approve(adjustmentId))
      .then((response) => response.data),
  rejectStockAdjustment: ({
    adjustmentId,
    request,
  }: {
    adjustmentId: string
    request: RejectStockAdjustmentRequest
  }) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.stockAdjustments.reject(adjustmentId), request)
      .then((response) => response.data),
}
