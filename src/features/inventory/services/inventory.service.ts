import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type { InventoryBalanceListResponse, InventoryListQuery } from '../types/inventory.types'

export const inventoryService = {
  getInventory: (params: InventoryListQuery) =>
    axiosClient
      .get<ApiResponse<InventoryBalanceListResponse>>(API_ENDPOINTS.inventory.list, { params })
      .then((response) => response.data),
}
