import type { TransferStatus } from '../types/transfer.types'

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  Draft: 'Chờ duyệt',
  InTransit: 'Đang điều chuyển',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
}

export const TRANSFER_STATUS_DESCRIPTIONS: Record<TransferStatus, string> = {
  Draft: 'Phiếu vừa tạo, đang chờ quản lý duyệt hoặc từ chối.',
  InTransit: 'Phiếu đã duyệt. Kho xuất chuẩn bị hàng rồi kho nhận xác nhận.',
  Completed: 'Kho nhận đã xác nhận, tồn kho đã được cập nhật.',
  Cancelled: 'Phiếu bị từ chối hoặc đã hủy.',
}

export function formatTransferQuantity(value: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
}

export function formatTransferDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function canApproveTransfer(status: TransferStatus): boolean {
  return status === 'Draft'
}

export function canDispatchTransfer(status: TransferStatus): boolean {
  return status === 'InTransit'
}

export function canReceiveTransfer(status: TransferStatus): boolean {
  return status === 'InTransit'
}
