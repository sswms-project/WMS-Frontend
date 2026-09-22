export interface WarehouseResponse {
  id: string
  warehouseCode: string
  warehouseName: string
  address: string | null
  status: string
  createdAt: string
  rowVersion?: string | null
}

export interface WarehouseDetailResponse extends WarehouseResponse {
  zoneCount: number
  modifiedAt: string | null
}

export interface SlotResponse {
  id: string
  slotCode: string
  status: string
  isActive: boolean
  isOutboundStaging?: boolean
  allowsMixedProducts?: boolean
  capacity: number | null
  currentOccupancy: number
  barcodeValue: string | null
  rowVersion?: string | null
}

export interface RackResponse {
  id: string
  rackCode: string
  rackName: string
  status: string
  storageMode?: 'RackLevel' | 'SlotLevel'
  allowsMixedProducts?: boolean
  capacity?: number | null
  rowVersion?: string | null
  slots: SlotResponse[]
}

export interface ZoneResponse {
  id: string
  zoneCode: string
  zoneName: string
  description: string | null
  status: string
  rowVersion?: string | null
  racks: RackResponse[]
}
