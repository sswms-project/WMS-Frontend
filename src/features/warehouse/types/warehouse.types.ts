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
  expectedRowVersion: string
}

export interface WarehouseLifecycleRequest {
  reason: string | null
  expectedRowVersion: string
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
  barcodeValue: string | null
  isOutboundStaging: boolean
  rowVersion?: string | null
}

export interface ConfigureOutboundStagingRequest {
  isOutboundStaging: boolean
  expectedRowVersion: string
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

export interface UpdateZoneRequest extends CreateZoneRequest {
  expectedRowVersion: string
}

export type RackStorageMode = 'RackLevel' | 'SlotLevel'

export interface CreateRackRequest {
  rackCode: string
  rackName: string
  storageMode: RackStorageMode
  allowsMixedProducts: boolean
  capacity: number | null
}

export interface UpdateRackRequest extends CreateRackRequest {
  expectedRowVersion: string
}

export interface CreateSlotRequest {
  slotCode: string
  allowsMixedProducts: boolean
  capacity: number | null
}

export interface UpdateSlotRequest extends CreateSlotRequest {
  expectedRowVersion: string
}

export interface LocationBarcodeResponse {
  locationId: string
  locationType: WarehouseLocationType
  locationCode: string
  barcodeValue: string
  displayPath?: string
  symbology: 'Code128'
}
