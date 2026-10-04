import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptItem } from '../../types/inbound.types'

interface ReceiptItemsTableProps {
  readonly items: readonly GoodsReceiptItem[]
}

export function ReceiptItemsTable({ items }: ReceiptItemsTableProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <Table className="min-w-[820px]">
        <TableHeader className="bg-card sticky top-0 z-10">
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="text-right">Theo yêu cầu nhập</TableHead>
            <TableHead>Đơn vị chính</TableHead>
            <TableHead>Đơn vị quy đổi</TableHead>
            <TableHead className="text-right">Thực nhận</TableHead>
            <TableHead className="text-right">Hỏng</TableHead>
            <TableHead className="text-right">Khả dụng</TableHead>
            <TableHead className="text-right">Còn cất</TableHead>
            <TableHead>Lô hàng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted-foreground font-mono text-xs">{item.productSKU}</p>
                {item.exceptionReason ? (
                  <p className="text-destructive mt-1 text-xs">{item.exceptionReason}</p>
                ) : null}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(item.orderedQuantity)}
              </TableCell>
              <TableCell>{item.baseUnitName}</TableCell>
              <TableCell>
                {item.enteredUnitId &&
                item.enteredUnitId !== item.baseUnitId &&
                item.enteredUnitName
                  ? `1 ${item.enteredUnitName} = ${formatQuantity(item.conversionFactorSnapshot)} ${item.baseUnitName}`
                  : '—'}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(item.receivedQuantity)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(item.damagedQuantity)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(item.usableQuantity)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(item.remainingPutAwayQuantity)}
              </TableCell>
              <TableCell>
                {item.lotNumber ? (
                  <div className="text-xs">
                    <p className="font-mono font-medium">{item.lotNumber}</p>
                    <p className="text-muted-foreground">
                      SX {item.manufacturedDate ?? '—'} · HSD {item.expiryDate ?? '—'}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">Theo số lượng</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
