import type { GoodsReceiptStatus } from '../types/inbound.types'

export const INBOUND_STATUS_LABELS: Record<GoodsReceiptStatus, string> = {
  Draft: 'Bản nháp',
  PendingApproval: 'Chờ duyệt',
  InspectionCorrectionRequired: 'Cần sửa kiểm hàng',
  Approved: 'Chờ cất hàng',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
}
