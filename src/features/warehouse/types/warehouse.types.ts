import type { QueryInfo } from '@/types/api'

export interface WarehouseListQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
}

export interface CreateWarehouseRequest {
  warehouseCode: string
  warehouseName: string
  address: string | null
}

export interface UpdateWarehouseRequest {
  warehouseName: string
  address: string
}

export type WarehouseLocationType = 'Zone' | 'Rack' | 'Slot'
export type LocationLifecycleStatus = 'Active' | 'Inactive'
export type SlotOccupancyStatus = 'Vacant' | 'Occupied' | 'Reserved' | 'Full'

export interface WarehouseLocationQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
  type?: WarehouseLocationType
  lifecycleStatus?: LocationLifecycleStatus
  occupancyStatus?: SlotOccupancyStatus
  zoneId?: string
  rackId?: string
}

export interface LocationSearchResponse {
  id: string
  type: WarehouseLocationType
  code: string
  name: string | null
  lifecycleStatus: LocationLifecycleStatus
  occupancyStatus: SlotOccupancyStatus | null
  zoneId: string | null
  zoneCode: string | null
  rackId: string | null
  rackCode: string | null
  capacity: number | null
  currentOccupancy: number | null
}

export interface LocationFilterState {
  type: WarehouseLocationType | ''
  lifecycleStatus: LocationLifecycleStatus | ''
  occupancyStatus: SlotOccupancyStatus | ''
  zoneId: string
  rackId: string
}

export interface CreateZoneRequest {
  zoneCode: string
  zoneName: string
  description: string
}

export type UpdateZoneRequest = CreateZoneRequest

export interface CreateRackRequest {
  rackCode: string
  rackName: string
}

export type UpdateRackRequest = CreateRackRequest

export interface CreateSlotRequest {
  slotCode: string
  capacity: number
}

export type UpdateSlotRequest = CreateSlotRequest

export interface LocationBarcodeResponse {
  locationId: string
  locationType: WarehouseLocationType
  locationCode: string
  barcodeValue: string
  symbology: 'Code128'
}
