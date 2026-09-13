import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { inventoryService } from '../services/inventory.service'
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

export function useInventoryQuery(params: InventoryListQuery, enabled = true) {
  return useQuery<InventoryBalanceListResponse, ApiErrorResponse>({
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
  return useQuery<InventoryBalanceListResponse['items'], ApiErrorResponse>({
    queryKey: queryKeys.inventory.reservations(params),
    queryFn: () => inventoryService.getReservations(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useReserveStockMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ReserveStockRequest>({
    mutationFn: inventoryService.reserveStock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error) => logger.error(error),
  })
}

export function useReleaseReservationMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ReleaseReservationRequest>({
    mutationFn: inventoryService.releaseReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error) => logger.error(error),
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

export function useInventoryAbcQuery(params: InventoryAbcQuery) {
  return useQuery<InventoryAbcItem[], ApiErrorResponse>({
    queryKey: queryKeys.inventory.abc(params),
    queryFn: () => inventoryService.getAbcClassification(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
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

export function useInventoryStockHistoryQuery(params: InventoryStockHistoryQuery, enabled = true) {
  return useQuery<InventoryStockHistoryResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.history(params),
    queryFn: () => inventoryService.getStockHistory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}
