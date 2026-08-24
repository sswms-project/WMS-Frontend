import type { InboundReceiptStatus } from '../types/inbound.types'

export const INBOUND_STATUS_LABELS: Record<InboundReceiptStatus, string> = {
  Draft: 'Bản nháp',
  PendingApproval: 'Chờ duyệt',
  Approved: 'Chờ cất hàng',
  Completed: 'Hoàn tất',
  Rejected: 'Đã từ chối',
}
