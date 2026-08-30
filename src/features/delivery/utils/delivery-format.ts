import type { DeliveryStatus } from '../types/delivery.types'

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  Pending: 'Chờ xử lý',
  Picking: 'Đang lấy hàng',
  Packing: 'Đang đóng gói',
  ReadyToShip: 'Sẵn sàng giao',
  AssignedToTransport: 'Đã bàn giao vận chuyển',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Failed: 'Giao thất bại',
}

const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  Pending: [],
  Picking: [],
  Packing: [],
  ReadyToShip: ['AssignedToTransport'],
  AssignedToTransport: ['Shipping', 'Failed'],
  Shipping: ['Delivered', 'Failed'],
  Delivered: [],
  Failed: ['AssignedToTransport'],
}

export function getNextDeliveryStatuses(current: DeliveryStatus): readonly DeliveryStatus[] {
  return DELIVERY_STATUS_TRANSITIONS[current] ?? []
}

export function isDeliveryFinished(status: DeliveryStatus): boolean {
  return status === 'Delivered'
}

export function formatDeliveryDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
