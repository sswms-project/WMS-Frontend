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
  outboundOrderId?: string
  status?: DeliveryStatus
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
  currentStatus: OutboundOrderStatus
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
}

export interface DeliveryFilters {
  status: DeliveryStatus | ''
  searchText: string
}
