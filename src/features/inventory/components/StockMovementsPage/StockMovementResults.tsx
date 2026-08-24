import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StockMovement } from '../../types/inventory.types'
import { formatInventoryDate } from '../../utils/inventory-format'
import {
  formatReferenceId,
  formatStockMovementQuantity,
  formatStockMovementType,
} from '../../utils/stock-movement-format'

function QuantityChange({ value }: { readonly value: number }) {
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus
  return (
    <span
      className={
        value > 0
          ? 'text-emerald-700 dark:text-emerald-400'
          : value < 0
            ? 'text-destructive'
            : 'text-muted-foreground'
      }
    >
      <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums">
        <Icon className="size-3.5" aria-hidden="true" />
        {formatStockMovementQuantity(value)}
      </span>
    </span>
  )
}

function MovementBadge({ value }: { readonly value: string }) {
  return <Badge variant="outline">{formatStockMovementType(value)}</Badge>
}

export function StockMovementMobileList({ items }: { readonly items: readonly StockMovement[] }) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex items-center justify-between gap-3">
              <span className="truncate">{item.productName || 'Sản phẩm chưa xác định'}</span>
              <QuantityChange value={item.quantity} />
            </ItemTitle>
            <ItemDescription>
              <span className="font-mono" translate="no">
                {item.sku || item.productId}
              </span>{' '}
              · Slot {item.slotCode || item.slotId}
            </ItemDescription>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <MovementBadge value={item.movementType} />
              <span className="text-muted-foreground">{formatInventoryDate(item.createdAt)}</span>
            </div>
            <ItemDescription>
              {item.createdByName || 'Người dùng chưa xác định'} ·{' '}
              {item.referenceType || 'Không có nguồn'}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

export function StockMovementDesktopTable({ items }: { readonly items: readonly StockMovement[] }) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1080px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-40">Thời gian</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36">Loại</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-64">Sản phẩm</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32">Slot</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-28 text-right">Biến động</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-48">Chứng từ</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-48">Người thực hiện</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-muted-foreground text-xs">
                {formatInventoryDate(item.createdAt)}
              </TableCell>
              <TableCell>
                <MovementBadge value={item.movementType} />
              </TableCell>
              <TableCell className="min-w-0">
                <p className="truncate font-medium">
                  {item.productName || 'Sản phẩm chưa xác định'}
                </p>
                <p className="text-muted-foreground truncate font-mono text-xs" translate="no">
                  {item.sku || item.productId}
                </p>
              </TableCell>
              <TableCell className="truncate font-mono text-xs" title={item.slotId}>
                {item.slotCode || item.slotId}
              </TableCell>
              <TableCell className="text-right">
                <QuantityChange value={item.quantity} />
              </TableCell>
              <TableCell className="min-w-0">
                <p className="truncate">{item.referenceType || 'Không có nguồn'}</p>
                <p
                  className="text-muted-foreground truncate font-mono text-xs"
                  title={item.referenceId}
                >
                  {formatReferenceId(item.referenceId)}
                </p>
              </TableCell>
              <TableCell className="truncate" title={item.createdByName || item.createdBy}>
                {item.createdByName || 'Người dùng chưa xác định'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
