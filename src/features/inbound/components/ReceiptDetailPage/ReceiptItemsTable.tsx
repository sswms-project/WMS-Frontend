import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatQuantity,
  formatOperationalDate,
} from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptItem } from '../../types/inbound.types'
import { InboundColumnLabel } from '../InboundWorkspace'

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
            <TableHead className="text-right">
              <InboundColumnLabel
                label="SL yêu cầu"
                description="Số lượng yêu cầu nhập kho, tính theo đơn vị tính chính (ĐVT)."
              />
            </TableHead>
            <TableHead>
              <InboundColumnLabel
                label="ĐVT"
                description="Đơn vị tính chính dùng cho các cột số lượng. Ví dụ: Lon."
              />
            </TableHead>
            <TableHead>
              <InboundColumnLabel
                label="ĐVQĐ"
                description="Đơn vị quy đổi theo yêu cầu nhập. Ví dụ: 1 Thùng = 24 Lon."
              />
            </TableHead>
            <TableHead className="text-right">
              <InboundColumnLabel
                label="SL thực nhận"
                description="Số lượng thực nhận trên phiếu này, bao gồm hàng hỏng, tính theo ĐVT."
              />
            </TableHead>
            <TableHead className="text-right">
              <InboundColumnLabel
                label="SL hỏng"
                description="Số lượng hàng hỏng trong số thực nhận, tính theo ĐVT."
              />
            </TableHead>
            <TableHead className="text-right">
              <InboundColumnLabel
                label="SL đạt"
                description="Số lượng hàng đạt để cất: số thực nhận trừ số hỏng, tính theo ĐVT."
              />
            </TableHead>
            <TableHead className="text-right">
              <InboundColumnLabel
                label="SL cần cất"
                description="Số lượng hàng đạt còn phải cất vào vị trí, tính theo ĐVT."
              />
            </TableHead>
            <TableHead>Vị trí cất</TableHead>
            <TableHead>Số lô</TableHead>
            <TableHead>Hạn sử dụng</TableHead>
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
                {item.putAwayDetails.length ? (
                  <ul className="flex flex-col gap-1">
                    {item.putAwayDetails.map((detail) => (
                      <li key={detail.id}>
                        {detail.isSystemDefaultSlot ? `Kệ ${detail.rackCode}` : detail.slotCode} ·{' '}
                        {formatQuantity(detail.quantity)} {item.baseUnitName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Chưa cất hàng'
                )}
              </TableCell>
              <TableCell>
                <p className="font-mono">{item.lotNumber ?? '—'}</p>
                {item.manufacturedDate ? (
                  <p className="text-muted-foreground text-xs">
                    SX {formatOperationalDate(item.manufacturedDate)}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                {item.expiryDate ? formatOperationalDate(item.expiryDate) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
