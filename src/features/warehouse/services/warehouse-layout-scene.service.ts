import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  SaveWarehouseLayoutSceneRequest,
  WarehouseLayoutSceneResponse,
} from '../types/warehouse-layout-scene.types'

export const warehouseLayoutSceneService = {
  getScene: (warehouseId: string) =>
    axiosClient
      .get<
        ApiResponse<WarehouseLayoutSceneResponse>
      >(API_ENDPOINTS.warehouses.layoutScene(warehouseId))
      .then((response) => response.data),

  saveScene: (warehouseId: string, request: SaveWarehouseLayoutSceneRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.warehouses.layoutScene(warehouseId), request)
      .then((response) => response.data),
}
