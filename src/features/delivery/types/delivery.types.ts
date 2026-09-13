import type { OutboundOrderStatus } from '@/features/outbound/types/outbound.types'

export const DELIVERY_STATUSES = [
  'Pending',
  'Picking',
  'Packing',
  'ReadyToShip',
  'AssignedToTransport',
  'Shipping',
  'Delivered',
  'Failed',
] as const

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]

export interface DeliveryListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  outboundOrderId?: string
  warehouseId?: string
  customerId?: string
  status?: DeliveryStatus
  dateFrom?: string
  dateTo?: string
}

export interface DeliveryStatusHistory {
  id: string
  outboundOrderId: string
  oldStatus: string
  newStatus: string
  note: string | null
  updatedAt: string
}

export interface DeliveryTracking {
  outboundOrderId: string
  orderCode: string
  warehouseId: string
  warehouseName: string
  customerId: string
  customerName: string
  recipientName: string
  assignedDeliveryStaffId: string | null
  assignedDeliveryStaffName: string | null
  currentStatus: OutboundOrderStatus
  createdAt: string
  deliveredAt: string | null
  failedReason: string | null
  history: DeliveryStatusHistory[]
}

export interface DeliveryListResponse {
  items: DeliveryTracking[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface UpdateDeliveryStatusRequest {
  newStatus: DeliveryStatus
  note: string | null
  assignedDeliveryStaffId?: string | null
}

export interface DeliveryFilters {
  status: DeliveryStatus | ''
  searchText: string
}
