export interface WarehouseResponse {
  id: string
  warehouseCode: string
  warehouseName: string
  address: string | null
  status: string
  createdAt: string
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
  capacity: number
  currentOccupancy: number
  barcodeValue: string | null
}

export interface RackResponse {
  id: string
  rackCode: string
  rackName: string
  status: string
  slots: SlotResponse[]
}

export interface ZoneResponse {
  id: string
  zoneCode: string
  zoneName: string
  description: string | null
  status: string
  racks: RackResponse[]
}
