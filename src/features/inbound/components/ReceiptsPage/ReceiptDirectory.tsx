import { Eye, RefreshCw, Search } from 'lucide-react'
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { APP_ROUTES } from '@/routes/app-routes'
import type { InboundReceiptStatus, InboundReceiptSummary } from '../../types/inbound.types'
import { INBOUND_STATUS_LABELS } from '../../utils/inbound-format'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/purchase-order/utils/purchase-order-format'
import { InboundStatusBadge } from '../InboundWorkspace'

interface ReceiptDirectoryProps {
  readonly items: readonly InboundReceiptSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: InboundReceiptStatus | ''
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: InboundReceiptStatus | '') => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}

export function ReceiptDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onRetry,
}: ReceiptDirectoryProps) {
  return (
    <section className="bg-card flex min-h-0 flex-col border">
      <div className="flex shrink-0 flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Danh sách phiếu nhập</h2>
          <p className="text-muted-foreground text-xs tabular-nums">{totalCount} phiếu</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <InputGroup className="min-w-0 flex-1 sm:w-64">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm phiếu nhập"
              placeholder="Tìm mã phiếu, mã PO…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          <NativeSelect
            aria-label="Lọc trạng thái phiếu nhập"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as InboundReceiptStatus | '')}
          >
            <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
            {Object.entries(INBOUND_STATUS_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
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
        <OperationalErrorState title="Không thể tải phiếu nhập" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Chưa có phiếu nhập phù hợp"
          description="Phiếu nhận hàng được lưu sẽ xuất hiện tại đây."
        />
      ) : (
        <>
          <ItemGroup className="gap-0 md:hidden">
            {items.map((item) => (
              <Item key={item.id} className="border-b last:border-b-0">
                <ItemContent>
                  <ItemTitle className="flex flex-wrap items-center gap-2">
                    <Link
                      href={APP_ROUTES.inboundReceiptDetail(item.id) as Route}
                      className="font-mono font-semibold hover:underline"
                    >
                      {item.receiptCode}
                    </Link>
                    <InboundStatusBadge status={item.status} />
                  </ItemTitle>
                  <ItemDescription>
                    {item.poNumber} · {item.warehouseName}
                  </ItemDescription>
                  <ItemDescription>
                    Nhận {formatQuantity(item.receivedQuantity)} · Hỏng{' '}
                    {formatQuantity(item.damagedQuantity)}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-card sticky top-0 z-10">Mã phiếu</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Đơn mua</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Kho</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Trạng thái</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10 text-right">
                    Nhận / Hỏng
                  </TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Người tạo</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">Ngày tạo</TableHead>
                  <TableHead className="bg-card sticky top-0 z-10">
                    <span className="sr-only">Thao tác</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={APP_ROUTES.inboundReceiptDetail(item.id) as Route}
                        className="font-mono font-semibold hover:underline"
                      >
                        {item.receiptCode}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{item.poNumber}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>
                      <InboundStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(item.receivedQuantity)} /{' '}
                      {formatQuantity(item.damagedQuantity)}
                    </TableCell>
                    <TableCell>{item.createdByName}</TableCell>
                    <TableCell>{formatOperationalDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={APP_ROUTES.inboundReceiptDetail(item.id) as Route}
                          aria-label={`Xem ${item.receiptCode}`}
                        >
                          <Eye aria-hidden="true" />
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
