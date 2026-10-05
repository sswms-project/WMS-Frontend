import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptItem, PutAwayDetail } from '../../types/inbound.types'

interface ReceiptPutAwayTableProps {
  readonly items: readonly GoodsReceiptItem[]
}

function formatPutAwayLocation(detail: PutAwayDetail) {
  return detail.isSystemDefaultSlot && detail.rackCode
    ? `Kệ ${detail.rackCode} (không chia ô)`
    : detail.slotCode
}

export function ReceiptPutAwayTable({ items }: ReceiptPutAwayTableProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <Table className="min-w-[920px]">
        <TableHeader className="bg-card sticky top-0 z-10">
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Đã cất vào</TableHead>
            <TableHead>Lô</TableHead>
            <TableHead>Chất lượng</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead>Người thực hiện</TableHead>
            <TableHead>Thời điểm</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.flatMap((item) =>
            item.putAwayDetails.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground font-mono text-xs">{item.productSKU}</p>
                </TableCell>
                <TableCell className="font-mono">{formatPutAwayLocation(detail)}</TableCell>
                <TableCell className="font-mono">{detail.lotNumber ?? '—'}</TableCell>
                <TableCell>{detail.qualityStatus}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(detail.quantity)}
                </TableCell>
                <TableCell>{detail.performedByName}</TableCell>
                <TableCell>{formatOperationalDate(detail.putAwayAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
