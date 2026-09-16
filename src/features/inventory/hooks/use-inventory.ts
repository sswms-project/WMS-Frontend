import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { inventoryService } from '../services/inventory.service'
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
  ReportDamagedStockRequest,
  RunInventoryAbcRequest,
  StockMovementListQuery,
  StockMovementListResponse,
  CreateForecastRunRequest,
  ForecastRun,
  AcceptReplenishmentSuggestionRequest,
  AcceptRebalancingSuggestionRequest,
  ForecastSuggestionType,
} from '../types/inventory.types'

export function useInventoryQuery(params: InventoryListQuery, enabled = true) {
  return useQuery<InventoryStockListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => inventoryService.getInventory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useStockMovementsQuery(params: StockMovementListQuery, enabled = true) {
  return useQuery<StockMovementListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.movements(params),
    queryFn: () => inventoryService.getStockMovements(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useInventoryReservationsQuery(params: InventoryReservationQuery) {
  return useQuery<InventoryReservation[], ApiErrorResponse>({
    queryKey: queryKeys.inventory.reservations(params),
    queryFn: () => inventoryService.getReservations(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useReportDamagedStockMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, ReportDamagedStockRequest>({
    mutationFn: inventoryService.reportDamagedStock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error) => logger.error(error),
  })
}

export function useInventoryAbcQuery(params: InventoryAbcQuery, enabled = true) {
  return useQuery<InventoryAbcItem[], ApiErrorResponse>({
    queryKey: queryKeys.inventory.abc(params),
    queryFn: () => inventoryService.getAbcClassification(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useRunInventoryAbcMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<InventoryAbcItem[]>, ApiErrorResponse, RunInventoryAbcRequest>({
    mutationFn: inventoryService.runAbcClassification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error) => logger.error(error),
  })
}

export function useInventoryForecastQuery(params: InventoryForecastQuery, enabled = true) {
  return useQuery<InventoryForecastResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.forecast(params),
    queryFn: () => inventoryService.getForecast(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useForecastRunQuery(id: string) {
  return useQuery<ForecastRun, ApiErrorResponse>({
    queryKey: queryKeys.inventory.forecastRun(id),
    queryFn: () => inventoryService.getForecastRun(id).then((response) => response.data),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === 'Pending' || query.state.data?.status === 'Running'
        ? 1_500
        : false,
  })
}

export function useCreateForecastRunMutation() {
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateForecastRunRequest>({
    mutationFn: inventoryService.createForecastRun,
    onError: (error) => logger.error(error),
  })
}

export function useExecuteForecastRunMutation() {
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inventoryService.executeForecastRun,
    onError: (error) => logger.error(error),
  })
}

export function useEvaluateForecastRunMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inventoryService.evaluateForecastRun,
    onSuccess: (_, id) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.forecastRun(id) }),
    onError: (error) => logger.error(error),
  })
}

export function useAcceptReplenishmentSuggestionMutation(runId: string) {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<string>,
    ApiErrorResponse,
    { id: string; request: AcceptReplenishmentSuggestionRequest }
  >({
    mutationFn: ({ id, request }) => inventoryService.acceptReplenishmentSuggestion(id, request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.forecastRun(runId) }),
    onError: (error) => logger.error(error),
  })
}

export function useAcceptRebalancingSuggestionMutation(runId: string) {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<string>,
    ApiErrorResponse,
    { id: string; request: AcceptRebalancingSuggestionRequest }
  >({
    mutationFn: ({ id, request }) => inventoryService.acceptRebalancingSuggestion(id, request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.forecastRun(runId) }),
    onError: (error) => logger.error(error),
  })
}

export function useRejectForecastSuggestionMutation(runId: string) {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    { id: string; suggestionType: ForecastSuggestionType }
  >({
    mutationFn: ({ id, suggestionType }) =>
      inventoryService.rejectForecastSuggestion(id, suggestionType),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.forecastRun(runId) }),
    onError: (error) => logger.error(error),
  })
}

export function useInventoryStockHistoryQuery(params: InventoryStockHistoryQuery, enabled = true) {
  return useQuery<InventoryStockHistoryResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.history(params),
    queryFn: () => inventoryService.getStockHistory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}
