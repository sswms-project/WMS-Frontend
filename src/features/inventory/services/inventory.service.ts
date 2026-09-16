import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  InventoryStockListResponse,
  InventoryReservation,
  InventoryAbcItem,
  InventoryAbcQuery,
  InventoryForecastQuery,
  InventoryForecastResponse,
  InventoryListQuery,
  InventoryReservationQuery,
  InventoryStockHistoryQuery,
  InventoryStockHistoryResponse,
  CreateForecastRunRequest,
  ForecastRun,
  AcceptReplenishmentSuggestionRequest,
  AcceptRebalancingSuggestionRequest,
  ForecastSuggestionType,
  ReportDamagedStockRequest,
  RunInventoryAbcRequest,
  StockMovementListQuery,
  StockMovementListResponse,
} from '../types/inventory.types'

export const inventoryService = {
  getInventory: (params: InventoryListQuery) =>
    axiosClient
      .get<ApiResponse<InventoryStockListResponse>>(API_ENDPOINTS.inventory.list, { params })
      .then((response) => response.data),
  getStockMovements: (params: StockMovementListQuery) =>
    axiosClient
      .get<ApiResponse<StockMovementListResponse>>(API_ENDPOINTS.inventory.movements, { params })
      .then((response) => response.data),
  getReservations: (params: InventoryReservationQuery) =>
    axiosClient
      .get<ApiResponse<InventoryReservation[]>>(API_ENDPOINTS.inventory.reservations, {
        params,
      })
      .then((response) => response.data),
  reportDamagedStock: (request: ReportDamagedStockRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.damaged, request)
      .then((response) => response.data),
  getAbcClassification: (params: InventoryAbcQuery) =>
    axiosClient
      .get<ApiResponse<InventoryAbcItem[]>>(API_ENDPOINTS.inventory.abcClassification, { params })
      .then((response) => response.data),
  runAbcClassification: (request: RunInventoryAbcRequest) =>
    axiosClient
      .post<ApiResponse<InventoryAbcItem[]>>(API_ENDPOINTS.inventory.runAbcClassification, request)
      .then((response) => response.data),
  getForecast: (params: InventoryForecastQuery) =>
    axiosClient
      .get<ApiResponse<InventoryForecastResponse>>(API_ENDPOINTS.inventory.forecast, { params })
      .then((response) => response.data),
  createForecastRun: (request: CreateForecastRunRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.forecastRuns, request)
      .then((response) => response.data),
  executeForecastRun: (id: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.executeForecastRun(id))
      .then((response) => response.data),
  getForecastRun: (id: string) =>
    axiosClient
      .get<ApiResponse<ForecastRun>>(API_ENDPOINTS.inventory.forecastRun(id))
      .then((response) => response.data),
  evaluateForecastRun: (id: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.evaluateForecastRun(id))
      .then((response) => response.data),
  acceptReplenishmentSuggestion: (id: string, request: AcceptReplenishmentSuggestionRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.acceptReplenishmentSuggestion(id), request)
      .then((response) => response.data),
  acceptRebalancingSuggestion: (id: string, request: AcceptRebalancingSuggestionRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.acceptRebalancingSuggestion(id), request)
      .then((response) => response.data),
  rejectForecastSuggestion: (id: string, suggestionType: ForecastSuggestionType) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.rejectForecastSuggestion(id), {
        suggestionType,
      })
      .then((response) => response.data),
  getStockHistory: (params: InventoryStockHistoryQuery) =>
    axiosClient
      .get<ApiResponse<InventoryStockHistoryResponse>>(API_ENDPOINTS.inventory.history, { params })
      .then((response) => response.data),
}
