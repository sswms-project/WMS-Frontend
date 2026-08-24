import { PackagePlus, RefreshCw, Search } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ReceivingTask } from '../../types/inbound.types'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/purchase-order/utils/purchase-order-format'

interface ReceivingTaskDirectoryProps {
  readonly items: readonly ReceivingTask[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onReceive: (task: ReceivingTask) => void
  readonly onRetry: () => void
}

export function ReceivingTaskDirectory({
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
  onReceive,
  onRetry,
}: ReceivingTaskDirectoryProps) {
  return (
    <section className="bg-card flex min-h-0 flex-col border">
      <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Đơn chờ nhận hàng</h2>
          <p className="text-muted-foreground text-xs tabular-nums">{totalCount} đơn đang mở</p>
        </div>
        <div className="flex gap-2">
          <InputGroup className="min-w-0 flex-1 sm:w-72">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm đơn chờ nhận"
              placeholder="Tìm mã PO, nhà cung cấp…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Tải lại"
                onClick={onRetry}
              >
                <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tải lại</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {isLoading ? (
        <OperationalLoadingState />
      ) : isError ? (
        <OperationalErrorState title="Không thể tải danh sách chờ nhận" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Không có đơn chờ nhận"
          description="Các đơn mua đã duyệt và còn số lượng sẽ xuất hiện tại đây."
        />
      ) : (
        <>
          <ItemGroup className="gap-0 md:hidden">
            {items.map((item) => (
              <Item key={item.purchaseOrderId} className="border-b last:border-b-0">
                <ItemContent>
                  <ItemTitle className="font-mono">{item.poNumber}</ItemTitle>
                  <ItemDescription>
                    {item.supplierName} · {item.warehouseName}
                  </ItemDescription>
                  <ItemDescription>
                    {formatQuantity(item.remainingQuantity)} còn nhận ·{' '}
                    {formatOperationalDate(item.expectedDate)}
                  </ItemDescription>
                </ItemContent>
                <Button type="button" size="sm" onClick={() => onReceive(item)}>
                  <PackagePlus aria-hidden="true" />
                  Nhận
                </Button>
              </Item>
            ))}
          </ItemGroup>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-card sticky top-0 z-10">Mã PO</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Nhà cung cấp</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Kho nhận</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10 text-right">
                    Đã nhận / Đặt
                  </TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Ngày dự kiến</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.purchaseOrderId}>
                    <TableCell className="font-mono font-semibold">{item.poNumber}</TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(item.receivedQuantity)} /{' '}
                      {formatQuantity(item.orderedQuantity)}
                    </TableCell>
                    <TableCell>{formatOperationalDate(item.expectedDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" size="sm" onClick={() => onReceive(item)}>
                        <PackagePlus aria-hidden="true" />
                        Nhận hàng
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
