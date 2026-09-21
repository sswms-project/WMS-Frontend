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
import type { GoodsReturnRequestSummary } from '../../types/stock-issue.types'
import {
  RETURN_ITEM_CONDITION_LABELS,
  formatStockIssueQuantity,
} from '../../utils/stock-issue-format'
import { GoodsReturnRequestStatusBadge } from './GoodsReturnRequestStatusBadge'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'

export function GoodsReturnRequestDetailSheet({
  item,
  isLoading,
  isError,
  onRetry,
  onOpenChange,
}: {
  readonly item: GoodsReturnRequestSummary | null
  readonly onOpenChange: (open: boolean) => void
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onRetry: () => void
}) {
  return (
    <Sheet open={Boolean(item) || isLoading || isError} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{item?.goodsReturnRequestCode ?? 'Chi tiết yêu cầu trả hàng'}</SheetTitle>
          <SheetDescription>
            {item
              ? `Yêu cầu xuất kho ${item.stockIssueRequestCode}`
              : 'Thông tin yêu cầu trả hàng.'}
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState
            title="Không thể tải chi tiết yêu cầu trả hàng"
            onRetry={onRetry}
          />
        ) : item ? (
          <div className="flex flex-col gap-4 px-4 pb-6">
            <div className="flex items-center gap-3">
              <GoodsReturnRequestStatusBadge status={item.status} />
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
                  <TableHead>Lô / dòng lấy</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.items.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.productName}</TableCell>
                    <TableCell className="font-mono">{line.sku}</TableCell>
                    <TableCell>
                      <p className="font-mono text-xs">{line.lotNumber ?? 'Theo số lượng'}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {line.stockIssuePickDetailId ?? '—'}
                      </p>
                    </TableCell>
                    <TableCell>{RETURN_ITEM_CONDITION_LABELS[line.condition]}</TableCell>
                    <TableCell className="text-right">
                      {formatStockIssueQuantity(line.quantity)}
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
