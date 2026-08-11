import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type { WarehouseDetailResponse, WarehouseResponse, ZoneResponse } from '@/types/warehouse'
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

export const warehouseService = {
  getWarehouses: (params: WarehouseListQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<WarehouseResponse>>>(API_ENDPOINTS.warehouses.list, { params })
      .then((response) => response.data),

  createWarehouse: (request: CreateWarehouseRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.warehouses.create, request)
      .then((response) => response.data),

  getWarehouse: (warehouseId: string) =>
    axiosClient
      .get<ApiResponse<WarehouseDetailResponse>>(API_ENDPOINTS.warehouses.detail(warehouseId))
      .then((response) => response.data),

  updateWarehouse: (warehouseId: string, request: UpdateWarehouseRequest) =>
    axiosClient
      .put<
        ApiResponse<WarehouseDetailResponse>
      >(API_ENDPOINTS.warehouses.update(warehouseId), request)
      .then((response) => response.data),

  getLayout: (warehouseId: string) =>
    axiosClient
      .get<ApiResponse<ZoneResponse[]>>(API_ENDPOINTS.warehouses.layout(warehouseId))
      .then((response) => response.data),

  getLocations: (warehouseId: string, params: WarehouseLocationQuery) =>
    axiosClient
      .get<
        ApiResponse<QueryResult<LocationSearchResponse>>
      >(API_ENDPOINTS.warehouses.locations(warehouseId), { params })
      .then((response) => response.data),

  createZone: (warehouseId: string, request: CreateZoneRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.warehouses.createZone(warehouseId), request)
      .then((response) => response.data),

  updateZone: (warehouseId: string, zoneId: string, request: UpdateZoneRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.warehouses.updateZone(warehouseId, zoneId), request)
      .then((response) => response.data),

  deactivateZone: (warehouseId: string, zoneId: string) =>
    axiosClient
      .patch<ApiResponse<unknown>>(API_ENDPOINTS.warehouses.deactivateZone(warehouseId, zoneId))
      .then((response) => response.data),

  createRack: (warehouseId: string, zoneId: string, request: CreateRackRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.warehouses.createRack(warehouseId, zoneId), request)
      .then((response) => response.data),

  updateRack: (warehouseId: string, zoneId: string, rackId: string, request: UpdateRackRequest) =>
    axiosClient
      .put<
        ApiResponse<unknown>
      >(API_ENDPOINTS.warehouses.updateRack(warehouseId, zoneId, rackId), request)
      .then((response) => response.data),

  deactivateRack: (warehouseId: string, zoneId: string, rackId: string) =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(API_ENDPOINTS.warehouses.deactivateRack(warehouseId, zoneId, rackId))
      .then((response) => response.data),

  createSlot: (warehouseId: string, rackId: string, request: CreateSlotRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.warehouses.createSlot(warehouseId, rackId), request)
      .then((response) => response.data),

  updateSlot: (warehouseId: string, rackId: string, slotId: string, request: UpdateSlotRequest) =>
    axiosClient
      .put<
        ApiResponse<unknown>
      >(API_ENDPOINTS.warehouses.updateSlot(warehouseId, rackId, slotId), request)
      .then((response) => response.data),

  deactivateSlot: (warehouseId: string, rackId: string, slotId: string) =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(API_ENDPOINTS.warehouses.deactivateSlot(warehouseId, rackId, slotId))
      .then((response) => response.data),

  getLocationBarcode: (
    warehouseId: string,
    locationType: WarehouseLocationType,
    locationId: string
  ) =>
    axiosClient
      .get<
        ApiResponse<LocationBarcodeResponse>
      >(API_ENDPOINTS.warehouses.locationBarcode(warehouseId, locationType, locationId))
      .then((response) => response.data),

  deactivateWarehouse: (warehouseId: string) =>
    axiosClient
      .patch<ApiResponse<unknown>>(API_ENDPOINTS.warehouses.deactivate(warehouseId))
      .then((response) => response.data),
}
