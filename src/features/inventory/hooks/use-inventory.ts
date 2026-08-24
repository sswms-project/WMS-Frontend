import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse } from '@/types/api'
import { inventoryService } from '../services/inventory.service'
import type { InventoryBalanceListResponse, InventoryListQuery } from '../types/inventory.types'

export function useInventoryQuery(params: InventoryListQuery) {
  return useQuery<InventoryBalanceListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => inventoryService.getInventory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}
