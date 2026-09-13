import type {
  OutboundOrderStatus,
  ReturnItemCondition,
  ReturnStatus,
} from '../types/outbound.types'

export const OUTBOUND_ORDER_STATUS_LABELS: Record<OutboundOrderStatus, string> = {
  Pending: 'Chờ xử lý',
  Picking: 'Đang lấy hàng',
  Packing: 'Đang đóng gói',
  ReadyToShip: 'Sẵn sàng giao',
  AssignedToTransport: 'Đã bàn giao vận chuyển',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Failed: 'Giao thất bại',
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  Requested: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Bị từ chối',
  Restocked: 'Đã nhập lại kho',
}

export const RETURN_ITEM_CONDITION_LABELS: Record<ReturnItemCondition, string> = {
  Good: 'Còn tốt',
  Damaged: 'Hư hỏng',
}

export function formatOutboundQuantity(value: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
}

export function formatOutboundDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function canIssueStock(status: OutboundOrderStatus): boolean {
  return status === 'Pending' || status === 'Picking'
}

export function canRecordReturn(status: OutboundOrderStatus): boolean {
  return status === 'Delivered' || status === 'Failed'
}

export function canApproveReturn(status: ReturnStatus): boolean {
  return status === 'Requested'
}
