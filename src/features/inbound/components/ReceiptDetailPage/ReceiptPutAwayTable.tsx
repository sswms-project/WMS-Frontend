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
import { InboundColumnLabel } from '../InboundWorkspace'

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
            <TableHead className="text-right">
              <InboundColumnLabel
                label="SL đã cất"
                description="Số lượng đã cất trong lần thao tác này, tính theo đơn vị tính chính ghi cạnh số lượng."
              />
            </TableHead>
            <TableHead>Quy đổi theo yêu cầu nhập</TableHead>
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
                <TableCell>
                  {detail.qualityStatus === 'Good'
                    ? 'Đạt'
                    : detail.qualityStatus === 'Damaged'
                      ? 'Hỏng'
                      : 'Chờ kiểm tra'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(detail.quantity)} {item.baseUnitName}
                </TableCell>
                <TableCell>
                  {item.enteredUnitId &&
                  item.enteredUnitId !== item.baseUnitId &&
                  item.enteredUnitName &&
                  item.conversionFactorSnapshot > 0
                    ? `${formatQuantity(detail.quantity / item.conversionFactorSnapshot)} ${item.enteredUnitName} (1 ${item.enteredUnitName} = ${formatQuantity(item.conversionFactorSnapshot)} ${item.baseUnitName})`
                    : '—'}
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
