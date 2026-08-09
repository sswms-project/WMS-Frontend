import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import type { WarehouseDetailResponse, WarehouseResponse, ZoneResponse } from '@/types/warehouse'
import { warehouseService } from '../services/warehouse.service'
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseListQuery,
} from '../types/warehouse.types'

interface UpdateWarehouseVariables {
  warehouseId: string
  request: UpdateWarehouseRequest
}

export function useWarehousesQuery(params: WarehouseListQuery) {
  return useQuery<QueryResult<WarehouseResponse>, ApiErrorResponse>({
    queryKey: queryKeys.warehouses.list(params),
    queryFn: () => warehouseService.getWarehouses(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useWarehouseQuery(warehouseId: string) {
  return useQuery<WarehouseDetailResponse, ApiErrorResponse>({
    queryKey: queryKeys.warehouses.detail(warehouseId),
    queryFn: () => warehouseService.getWarehouse(warehouseId).then((response) => response.data),
    enabled: Boolean(warehouseId),
  })
}

export function useWarehouseLayoutQuery(warehouseId: string, enabled: boolean) {
  return useQuery<ZoneResponse[], ApiErrorResponse>({
    queryKey: [...queryKeys.warehouses.detail(warehouseId), 'layout'] as const,
    queryFn: () => warehouseService.getLayout(warehouseId).then((response) => response.data),
    enabled: Boolean(warehouseId) && enabled,
  })
}

export function useCreateWarehouseMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateWarehouseRequest>({
    mutationFn: warehouseService.createWarehouse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
    },
    onError: (error) => console.error(error),
  })
}

export function useUpdateWarehouseMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<WarehouseDetailResponse>,
    ApiErrorResponse,
    UpdateWarehouseVariables
  >({
    mutationFn: ({ warehouseId, request }) =>
      warehouseService.updateWarehouse(warehouseId, request),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.warehouses.detail(variables.warehouseId),
        }),
      ])
    },
    onError: (error) => console.error(error),
  })
}
