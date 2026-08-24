import { ArrowRight, PackageCheck, RefreshCw, Search } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/purchase-order/utils/purchase-order-format'
import type { InboundReceiptSummary } from '../../types/inbound.types'

interface PutawayDirectoryProps {
  readonly items: readonly InboundReceiptSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}

function remainingQuantity(item: InboundReceiptSummary) {
  return Math.max(0, item.receivedQuantity - item.damagedQuantity - item.putAwayQuantity)
}

export function PutawayDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onPageChange,
  onRetry,
}: PutawayDirectoryProps) {
  return (
    <section className="bg-card flex min-h-0 flex-col border">
      <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Phiếu chờ cất hàng</h2>
          <p className="text-muted-foreground text-xs tabular-nums">
            {totalCount} phiếu còn hàng khả dụng
          </p>
        </div>
        <div className="flex gap-2">
          <InputGroup className="min-w-0 flex-1 sm:w-72">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm phiếu chờ cất"
              placeholder="Tìm mã phiếu, mã PO…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tải lại"
            onClick={onRetry}
          >
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
          </Button>
        </div>
      </div>
      {isLoading ? (
        <OperationalLoadingState />
      ) : isError ? (
        <OperationalErrorState title="Không thể tải danh sách chờ cất" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Không có hàng chờ cất"
          description="Phiếu đã duyệt và còn hàng khả dụng sẽ xuất hiện tại đây."
        />
      ) : (
        <>
          <ItemGroup className="gap-0 md:hidden">
            {items.map((item) => (
              <Item key={item.id} className="border-b last:border-b-0">
                <PackageCheck aria-hidden="true" />
                <ItemContent>
                  <ItemTitle className="font-mono">{item.receiptCode}</ItemTitle>
                  <ItemDescription>
                    {item.poNumber} · {item.warehouseName}
                  </ItemDescription>
                  <ItemDescription>
                    {formatQuantity(remainingQuantity(item))} còn cất
                  </ItemDescription>
                </ItemContent>
                <Button asChild size="icon-sm">
                  <Link
                    href={APP_ROUTES.inboundPutawayDetail(item.id) as Route}
                    aria-label={`Cất hàng ${item.receiptCode}`}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </Item>
            ))}
          </ItemGroup>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-card sticky top-0 z-10">Mã phiếu</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Đơn mua</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Kho</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10 text-right">Còn cất</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Ngày nhận</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-semibold">{item.receiptCode}</TableCell>
                    <TableCell className="font-mono">{item.poNumber}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatQuantity(remainingQuantity(item))}
                    </TableCell>
                    <TableCell>{formatOperationalDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={APP_ROUTES.inboundPutawayDetail(item.id) as Route}>
                          Phân bổ
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <OperationalPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            isPending={isFetching}
            onPageChange={onPageChange}
          />
        </>
      )}
    </section>
  )
}
