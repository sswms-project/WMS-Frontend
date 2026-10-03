import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InboundRequestLine } from '../../types/inbound-request.types'
import { formatQuantity } from '../../utils/inbound-request-format'

export function InboundRequestLines({ lines }: { readonly lines: readonly InboundRequestLine[] }) {
  return (
    <section className="bg-card border" aria-labelledby="inbound-request-lines">
      <div className="border-b p-4">
        <h2 id="inbound-request-lines" className="text-sm font-semibold">
          Chi tiết sản phẩm
        </h2>
        <p className="text-muted-foreground text-xs">{lines.length} dòng sản phẩm</p>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Số lượng nhập</TableHead>
              <TableHead className="text-right">Số lượng cơ sở</TableHead>
              <TableHead className="text-right">Đã nhận</TableHead>
              <TableHead className="text-right">Đã đóng</TableHead>
              <TableHead className="text-right">Còn lại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>
                  <p className="font-medium">{line.productName}</p>
                  <p className="text-muted-foreground font-mono text-xs">{line.productSKU}</p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(line.enteredQuantity)} {line.enteredUnitName ?? line.unitName}
                  {line.conversionFactorSnapshot !== 1 ? (
                    <span className="text-muted-foreground block text-xs">
                      ×{formatQuantity(line.conversionFactorSnapshot)}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(line.quantity)} {line.unitName}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(line.receivedQuantity)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(line.closedQuantity)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(line.remainingQuantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="divide-y md:hidden">
        {lines.map((line) => (
          <div key={line.id} className="p-4">
            <p className="font-medium">{line.productName}</p>
            <p className="text-muted-foreground font-mono text-xs">{line.productSKU}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatQuantity(line.enteredQuantity)} {line.enteredUnitName ?? line.unitName} →{' '}
              {formatQuantity(line.quantity)} {line.unitName}
              {line.conversionFactorSnapshot !== 1
                ? ` (×${formatQuantity(line.conversionFactorSnapshot)})`
                : ''}
            </p>
            <dl className="mt-3 grid grid-cols-4 gap-3">
              <Metadata label="Đặt" value={formatQuantity(line.quantity)} />
              <Metadata label="Đã nhận" value={formatQuantity(line.receivedQuantity)} />
              <Metadata label="Đã đóng" value={formatQuantity(line.closedQuantity)} />
              <Metadata label="Còn lại" value={formatQuantity(line.remainingQuantity)} />
            </dl>
          </div>
        ))}
      </div>
    </section>
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
