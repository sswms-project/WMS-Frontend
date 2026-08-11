import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import type { WarehouseDetailResponse, WarehouseResponse, ZoneResponse } from '@/types/warehouse'
import { warehouseService } from '../services/warehouse.service'
import type {
  CreateRackRequest,
  CreateSlotRequest,
  CreateZoneRequest,
  CreateWarehouseRequest,
  LocationBarcodeResponse,
  LocationSearchResponse,
  UpdateRackRequest,
  UpdateSlotRequest,
  UpdateZoneRequest,
  UpdateWarehouseRequest,
  WarehouseListQuery,
  WarehouseLocationQuery,
  WarehouseLocationType,
} from '../types/warehouse.types'

interface UpdateWarehouseVariables {
  warehouseId: string
  request: UpdateWarehouseRequest
}

interface CreateZoneVariables {
  warehouseId: string
  request: CreateZoneRequest
}

interface UpdateZoneVariables extends CreateZoneVariables {
  zoneId: string
  request: UpdateZoneRequest
}

interface CreateRackVariables {
  warehouseId: string
  zoneId: string
  request: CreateRackRequest
}

interface UpdateRackVariables extends CreateRackVariables {
  rackId: string
  request: UpdateRackRequest
}

interface CreateSlotVariables {
  warehouseId: string
  rackId: string
  request: CreateSlotRequest
}

interface UpdateSlotVariables extends CreateSlotVariables {
  slotId: string
  request: UpdateSlotRequest
}

interface DeactivateZoneVariables {
  warehouseId: string
  zoneId: string
}

interface DeactivateRackVariables extends DeactivateZoneVariables {
  rackId: string
}

interface DeactivateSlotVariables {
  warehouseId: string
  rackId: string
  slotId: string
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
    queryKey: queryKeys.warehouses.layout(warehouseId),
    queryFn: () => warehouseService.getLayout(warehouseId).then((response) => response.data),
    enabled: Boolean(warehouseId) && enabled,
  })
}

export function useWarehouseLocationsQuery(warehouseId: string, params: WarehouseLocationQuery) {
  return useQuery<QueryResult<LocationSearchResponse>, ApiErrorResponse>({
    queryKey: queryKeys.warehouses.locations(warehouseId, params),
    queryFn: () =>
      warehouseService.getLocations(warehouseId, params).then((response) => response.data),
    enabled: Boolean(warehouseId),
    placeholderData: (previousData) => previousData,
  })
}

export function useLocationBarcodeQuery(
  warehouseId: string,
  locationType: WarehouseLocationType,
  locationId: string
) {
  return useQuery<LocationBarcodeResponse, ApiErrorResponse>({
    queryKey: queryKeys.warehouses.barcode(warehouseId, locationType, locationId),
    queryFn: () =>
      warehouseService
        .getLocationBarcode(warehouseId, locationType, locationId)
        .then((response) => response.data),
    enabled: Boolean(warehouseId && locationId),
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

export function useDeactivateWarehouseMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: warehouseService.deactivateWarehouse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all })
    },
    onError: (error) => console.error(error),
  })
}

function useInvalidateWarehouseStructure() {
  const queryClient = useQueryClient()

  return async (warehouseId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.layout(warehouseId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.layoutScene(warehouseId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.locationsAll(warehouseId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(warehouseId) }),
    ])
  }
}

export function useCreateZoneMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateZoneVariables>({
    mutationFn: ({ warehouseId, request }) => warehouseService.createZone(warehouseId, request),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useUpdateZoneMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateZoneVariables>({
    mutationFn: ({ warehouseId, zoneId, request }) =>
      warehouseService.updateZone(warehouseId, zoneId, request),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useDeactivateZoneMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, DeactivateZoneVariables>({
    mutationFn: ({ warehouseId, zoneId }) => warehouseService.deactivateZone(warehouseId, zoneId),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useCreateRackMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateRackVariables>({
    mutationFn: ({ warehouseId, zoneId, request }) =>
      warehouseService.createRack(warehouseId, zoneId, request),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useUpdateRackMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateRackVariables>({
    mutationFn: ({ warehouseId, zoneId, rackId, request }) =>
      warehouseService.updateRack(warehouseId, zoneId, rackId, request),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useDeactivateRackMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, DeactivateRackVariables>({
    mutationFn: ({ warehouseId, zoneId, rackId }) =>
      warehouseService.deactivateRack(warehouseId, zoneId, rackId),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useCreateSlotMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateSlotVariables>({
    mutationFn: ({ warehouseId, rackId, request }) =>
      warehouseService.createSlot(warehouseId, rackId, request),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useUpdateSlotMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateSlotVariables>({
    mutationFn: ({ warehouseId, rackId, slotId, request }) =>
      warehouseService.updateSlot(warehouseId, rackId, slotId, request),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}

export function useDeactivateSlotMutation() {
  const invalidateStructure = useInvalidateWarehouseStructure()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, DeactivateSlotVariables>({
    mutationFn: ({ warehouseId, rackId, slotId }) =>
      warehouseService.deactivateSlot(warehouseId, rackId, slotId),
    onSuccess: async (_, variables) => invalidateStructure(variables.warehouseId),
    onError: (error) => console.error(error),
  })
}
