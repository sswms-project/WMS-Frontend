import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse } from '@/types/api'
import { inventoryService } from '../services/inventory.service'
import type {
  InventoryBalanceListResponse,
  InventoryListQuery,
  InventoryReservationQuery,
  StockMovementListQuery,
  StockMovementListResponse,
} from '../types/inventory.types'

export function useInventoryQuery(params: InventoryListQuery) {
  return useQuery<InventoryBalanceListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => inventoryService.getInventory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
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
