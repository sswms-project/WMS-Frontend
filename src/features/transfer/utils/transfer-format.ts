import type { TransferStatus } from '../types/transfer.types'

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  PendingSourceApproval: 'Chờ kho nguồn duyệt',
  Approved: 'Đã duyệt',
  InTransit: 'Đang điều chuyển',
  Completed: 'Hoàn tất',
  ReceivedWithVariance: 'Đã nhận có chênh lệch',
  Rejected: 'Bị từ chối',
  Cancelled: 'Đã hủy',
}

export const TRANSFER_STATUS_DESCRIPTIONS: Record<TransferStatus, string> = {
  PendingSourceApproval: 'Phiếu vừa tạo, đang chờ kho nguồn duyệt hoặc từ chối.',
  Approved: 'Phiếu đã được duyệt và đang chờ kho nguồn xuất hàng.',
  InTransit: 'Hàng đã rời kho nguồn và đang chờ kho đích xác nhận.',
  Completed: 'Kho nhận đã xác nhận, tồn kho đã được cập nhật.',
  ReceivedWithVariance: 'Kho nhận đã xác nhận và ghi nhận hàng hỏng hoặc thiếu.',
  Rejected: 'Kho nguồn đã từ chối yêu cầu điều chuyển.',
  Cancelled: 'Phiếu đã bị hủy.',
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
  return status === 'PendingSourceApproval'
}

export function canDispatchTransfer(status: TransferStatus): boolean {
  return status === 'Approved'
}

export function canReceiveTransfer(status: TransferStatus): boolean {
  return status === 'InTransit'
}
