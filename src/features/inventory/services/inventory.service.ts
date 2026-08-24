import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  InventoryBalanceListResponse,
  InventoryListQuery,
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
}
