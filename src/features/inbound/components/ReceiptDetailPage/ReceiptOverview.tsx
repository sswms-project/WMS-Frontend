import { formatOperationalDate } from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptDetail } from '../../types/inbound.types'

interface ReceiptOverviewProps {
  readonly receipt: GoodsReceiptDetail
}

export function ReceiptOverview({ receipt }: ReceiptOverviewProps) {
  return (
    <section className="bg-card shrink-0 border" aria-labelledby="receipt-overview-heading">
      <div className="border-b p-4">
        <h2 id="receipt-overview-heading" className="text-sm font-semibold">
          Tổng quan phiếu nhận hàng
        </h2>
      </div>
      <dl className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metadata label="Yêu cầu nhập kho" value={receipt.inboundRequestCode} />
        <Metadata label="Kho nhận" value={receipt.warehouseName} />
        <Metadata
          label="Người ghi nhận"
          value={receipt.receivingAssignedToName ?? receipt.createdByName}
        />
        <Metadata label="Ngày tạo" value={formatOperationalDate(receipt.createdAt)} />
        {receipt.status === 'Approved' || receipt.status === 'Completed' ? (
          <Metadata label="Người cất hàng" value={receipt.putAwayAssignedToName ?? 'Chưa giao'} />
        ) : null}
        {receipt.approvedByName ? (
          <Metadata label="Người duyệt" value={receipt.approvedByName} />
        ) : null}
      </dl>
      {receipt.rejectionReason ? (
        <div className="border-t p-4">
          <p className="text-destructive text-xs font-medium">Yêu cầu chỉnh sửa</p>
          <p className="mt-1 text-xs">{receipt.rejectionReason}</p>
        </div>
      ) : null}
    </section>
  )
}

function Metadata({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
    </div>
  )
}
