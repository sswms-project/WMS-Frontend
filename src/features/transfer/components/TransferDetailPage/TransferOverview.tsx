import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  formatOperationalDate,
  formatOperationalDateTime,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import type { TransferDetail } from '../../types/transfer.types'
import { TRANSFER_STATUS_DESCRIPTIONS } from '../../utils/transfer-format'
import { TransferStatusBadge } from '../TransfersPage'

interface OverviewItem {
  readonly label: string
  readonly value: string
}

function sumOf(transfer: TransferDetail, pick: (item: TransferDetail['items'][number]) => number) {
  return transfer.items.reduce((total, item) => total + pick(item), 0)
}

export function TransferOverview({ transfer }: { readonly transfer: TransferDetail }) {
  const requested = sumOf(transfer, (item) => item.quantity)
  const dispatched = sumOf(transfer, (item) => item.dispatchedQuantity)
  const received = sumOf(
    transfer,
    (item) => item.receivedQuantity + item.damagedQuantity + item.missingQuantity
  )
  const stopped = sumOf(transfer, (item) => item.stoppedQuantity)
  const items: OverviewItem[] = [
    { label: 'Kho xuất', value: transfer.sourceWarehouseName },
    { label: 'Kho nhập', value: transfer.destinationWarehouseName },
    { label: 'Người tạo', value: transfer.createdByName ?? '—' },
    { label: 'Ngày tạo', value: formatOperationalDateTime(transfer.createdAt) },
    {
      label: 'Hạn cần hàng',
      value: transfer.requiredBy ? formatOperationalDate(transfer.requiredBy) : 'Chưa đặt hạn',
    },
    { label: 'Lý do', value: transfer.reason || '—' },
    { label: 'Ghi chú', value: transfer.note || '—' },
    {
      label: 'Tiến độ (ĐVT chính)',
      value: `Yêu cầu ${formatQuantity(requested)} · Đã xuất ${formatQuantity(dispatched)} · Đã nhận ${formatQuantity(received)}${stopped > 0 ? ` · Đã dừng ${formatQuantity(stopped)}` : ''}`,
    },
  ]
  if (transfer.cancellationReason) {
    items.push({ label: 'Lý do hủy', value: transfer.cancellationReason })
  }
  if (transfer.stopReason) {
    items.push({ label: 'Lý do dừng phần còn lại', value: transfer.stopReason })
  }

  return (
    <section className="bg-card border p-4" aria-labelledby="transfer-overview-title">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="transfer-overview-title" className="text-sm font-semibold">
          Thông tin phiếu
        </h2>
        <TransferStatusBadge status={transfer.status} />
        <span className="text-muted-foreground text-xs">
          {TRANSFER_STATUS_DESCRIPTIONS[transfer.status]}
        </span>
      </div>
      {transfer.isLegacyWorkflow ? (
        <Alert className="mb-3">
          <Info aria-hidden="true" />
          <AlertTitle>Phiếu thuộc quy trình cũ</AlertTitle>
          <AlertDescription>
            Phiếu này được tạo trước khi chuyển sang quy trình đợt xuất mới nên chỉ xem được. Liên
            hệ quản trị để xử lý các phiếu còn dở.
          </AlertDescription>
        </Alert>
      ) : null}
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-muted-foreground text-xs">{item.label}</dt>
            <dd className="break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
