import { Progress } from '@/components/ui/progress'
import type { InboundRequestDetail } from '../../types/inbound-request.types'
import { formatOperationalDate, formatQuantity } from '../../utils/inbound-request-format'
import { inboundSourceLabels } from '../../schemas/inbound-request.schema'

export function InboundRequestOverview({ request }: { readonly request: InboundRequestDetail }) {
  const orderedQuantity = request.lines.reduce((sum, line) => sum + line.quantity, 0)
  const receivedQuantity = request.lines.reduce((sum, line) => sum + line.receivedQuantity, 0)
  const progress =
    orderedQuantity <= 0 ? 0 : Math.min(100, (receivedQuantity / orderedQuantity) * 100)

  return (
    <>
      <section className="bg-card border" aria-labelledby="inbound-request-overview">
        <div className="border-b p-4">
          <h2 id="inbound-request-overview" className="text-sm font-semibold">
            Tổng quan
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 p-4 lg:grid-cols-4">
          <Metadata label="Loại nguồn" value={inboundSourceLabels[request.sourceType]} />
          <Metadata
            label="Nguồn hàng"
            value={request.supplierName ?? request.sourceName ?? 'Chưa xác định'}
          />
          <Metadata label="Kho nhận" value={request.warehouseName ?? 'Chưa xác định'} />
          <Metadata label="Ngày dự kiến" value={formatOperationalDate(request.expectedDate)} />
          <Metadata label="Người tạo" value={request.createdByName} />
          {request.sourceReference ? (
            <Metadata label="Mã tham chiếu" value={request.sourceReference} />
          ) : null}
          <div className="col-span-2 lg:col-span-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <dt className="text-muted-foreground text-xs">Tiến độ nhận</dt>
              <dd className="text-xs font-medium tabular-nums">
                {formatQuantity(receivedQuantity)} / {formatQuantity(orderedQuantity)}
              </dd>
            </div>
            <Progress value={progress} />
          </div>
        </dl>
        {request.rejectionReason ? (
          <div className="border-t px-4 py-3">
            <p className="text-destructive text-xs font-medium">Yêu cầu chỉnh sửa</p>
            <p className="mt-1 text-xs">{request.rejectionReason}</p>
          </div>
        ) : null}
      </section>
    </>
  )
}

function Metadata({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  )
}
