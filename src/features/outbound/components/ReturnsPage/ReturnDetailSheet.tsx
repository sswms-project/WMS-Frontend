import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ReturnSummary } from '../../types/outbound.types'
import { RETURN_ITEM_CONDITION_LABELS, formatOutboundQuantity } from '../../utils/outbound-format'
import { ReturnStatusBadge } from './ReturnStatusBadge'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'

export function ReturnDetailSheet({
  item,
  isLoading,
  isError,
  onRetry,
  onOpenChange,
}: {
  readonly item: ReturnSummary | null
  readonly onOpenChange: (open: boolean) => void
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onRetry: () => void
}) {
  return (
    <Sheet open={Boolean(item) || isLoading || isError} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{item?.returnCode ?? 'Chi tiết phiếu hoàn'}</SheetTitle>
          <SheetDescription>
            {item ? `Đơn xuất ${item.orderCode}` : 'Thông tin phiếu hoàn hàng.'}
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải chi tiết phiếu hoàn" onRetry={onRetry} />
        ) : item ? (
          <div className="flex flex-col gap-4 px-4 pb-6">
            <div className="flex items-center gap-3">
              <ReturnStatusBadge status={item.status} />
              <p className="text-muted-foreground text-sm">{item.reason}</p>
            </div>
            {item.rejectionReason ? (
              <p className="text-destructive text-sm">Lý do từ chối: {item.rejectionReason}</p>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.items.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.productName}</TableCell>
                    <TableCell className="font-mono">{line.sku}</TableCell>
                    <TableCell>{RETURN_ITEM_CONDITION_LABELS[line.condition]}</TableCell>
                    <TableCell className="text-right">
                      {formatOutboundQuantity(line.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
