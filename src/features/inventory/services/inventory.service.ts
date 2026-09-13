import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  InventoryBalanceListResponse,
  InventoryAbcItem,
  InventoryAbcQuery,
  InventoryForecastQuery,
  InventoryForecastResponse,
  InventoryListQuery,
  InventoryReservationQuery,
  InventoryStockHistoryQuery,
  InventoryStockHistoryResponse,
  ReserveStockRequest,
  ReleaseReservationRequest,
  ReportDamagedStockRequest,
  StockMovementListQuery,
  StockMovementListResponse,
} from '../types/inventory.types'

export const inventoryService = {
  getInventory: (params: InventoryListQuery) =>
    axiosClient
      .get<ApiResponse<InventoryBalanceListResponse>>(API_ENDPOINTS.inventory.list, { params })
      .then((response) => response.data),
  getStockMovements: (params: StockMovementListQuery) =>
    axiosClient
      .get<ApiResponse<StockMovementListResponse>>(API_ENDPOINTS.inventory.movements, { params })
      .then((response) => response.data),
  getReservations: (params: InventoryReservationQuery) =>
    axiosClient
      .get<ApiResponse<InventoryBalanceListResponse['items']>>(
        API_ENDPOINTS.inventory.reservations,
        {
          params,
        }
      )
      .then((response) => response.data),
  reserveStock: (request: ReserveStockRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.reservations, request)
      .then((response) => response.data),
  releaseReservation: ({ inventoryBalanceId, quantity }: ReleaseReservationRequest) =>
    axiosClient
      .delete<ApiResponse<unknown>>(
        `${API_ENDPOINTS.inventory.reservations}/${inventoryBalanceId}`,
        {
          data: quantity,
        }
      )
      .then((response) => response.data),
  reportDamagedStock: (request: ReportDamagedStockRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.damaged, request)
      .then((response) => response.data),
  getAbcClassification: (params: InventoryAbcQuery) =>
    axiosClient
      .get<ApiResponse<InventoryAbcItem[]>>(API_ENDPOINTS.inventory.abcClassification, { params })
      .then((response) => response.data),
  getForecast: (params: InventoryForecastQuery) =>
    axiosClient
      .get<ApiResponse<InventoryForecastResponse>>(API_ENDPOINTS.inventory.forecast, { params })
      .then((response) => response.data),
  getStockHistory: (params: InventoryStockHistoryQuery) =>
    axiosClient
      .get<ApiResponse<InventoryStockHistoryResponse>>(API_ENDPOINTS.inventory.history, { params })
      .then((response) => response.data),
}
