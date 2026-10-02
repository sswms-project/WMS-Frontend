import { CalendarRange, Check, Eye, RefreshCw, Search, X } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import type { DateRange } from 'react-day-picker'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { dateToIsoDateString, formatDisplayDate, isoDateStringToDate } from '@/lib/date-format'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'
import type { GoodsReceiptStatus, GoodsReceiptSummary } from '../../types/inbound.types'
import { INBOUND_STATUS_LABELS } from '../../utils/inbound-format'
import {
  formatOperationalDateTime,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import { InboundStatusBadge } from '../InboundWorkspace'
import { TaskAssigneeCell } from '../TaskAssignment'

interface ReceiptDirectoryProps {
  readonly items: readonly GoodsReceiptSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: GoodsReceiptStatus | ''
  readonly createdFrom: string
  readonly createdTo: string
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly canApprove: boolean
  readonly isApproving: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: GoodsReceiptStatus | '') => void
  readonly onCreatedFromChange: (value: string) => void
  readonly onCreatedToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRetry: () => void
  readonly onApprove: (item: GoodsReceiptSummary) => void
}

export function ReceiptDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  createdFrom,
  createdTo,
  isLoading,
  isFetching,
  isError,
  canApprove,
  isApproving,
  onSearchChange,
  onStatusChange,
  onCreatedFromChange,
  onCreatedToChange,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onApprove,
}: ReceiptDirectoryProps) {
  return (
    <OperationalListPanel aria-label="Danh sách phiếu nhận hàng">
      <div className="flex shrink-0 flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Danh sách phiếu nhận hàng</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="min-w-0 flex-1 sm:w-64">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm phiếu nhận hàng"
              placeholder="Tìm mã phiếu, mã PO…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          <NativeSelect
            aria-label="Lọc trạng thái phiếu nhận hàng"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as GoodsReceiptStatus | '')}
          >
            <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
            {Object.entries(INBOUND_STATUS_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {(() => {
            const hasDate = Boolean(createdFrom || createdTo)
            const dateRange: DateRange = {
              from: isoDateStringToDate(createdFrom),
              to: isoDateStringToDate(createdTo),
            }
            const f = dateRange.from ? formatDisplayDate(dateRange.from) : null
            const t = dateRange.to ? formatDisplayDate(dateRange.to) : null
            const label = f && t ? `${f} – ${t}` : f ? `Từ ${f}` : t ? `Đến ${t}` : 'Khoảng ngày'
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={hasDate ? 'default' : 'outline'}
                    size="sm"
                    aria-label="Lọc theo khoảng ngày tạo"
                  >
                    <CalendarRange aria-hidden="true" />
                    {label}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="border-b p-3">
                    <PopoverTitle>Khoảng ngày tạo</PopoverTitle>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      onCreatedFromChange(range?.from ? dateToIsoDateString(range.from) : '')
                      onCreatedToChange(range?.to ? dateToIsoDateString(range.to) : '')
                    }}
                    numberOfMonths={1}
                  />
                  {hasDate ? (
                    <div className="border-t p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          onCreatedFromChange('')
                          onCreatedToChange('')
                        }}
                      >
                        <X aria-hidden="true" />
                        Xoá lọc ngày
                      </Button>
                    </div>
                  ) : null}
                </PopoverContent>
              </Popover>
            )
          })()}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Tải lại"
                onClick={onRetry}
              >
                <RefreshCw
                  className={cn('text-primary', isFetching && 'animate-spin')}
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tải lại</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {isLoading ? (
        <OperationalLoadingState />
      ) : isError ? (
        <OperationalErrorState title="Không thể tải phiếu nhận hàng" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Chưa có phiếu nhận hàng phù hợp"
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
                      href={APP_ROUTES.goodsReceiptDetail(item.id) as Route}
                      className="font-mono font-semibold hover:underline"
                    >
                      {item.receiptCode}
                    </Link>
                    <InboundStatusBadge status={item.status} />
                  </ItemTitle>
                  <ItemDescription>
                    {item.inboundRequestCode} · {item.warehouseName}
                  </ItemDescription>
                  <ItemDescription>
                    {item.lineCount} mặt hàng · Tạo lúc {formatOperationalDateTime(item.createdAt)}
                  </ItemDescription>
                  <ItemDescription>
                    Nhận {formatQuantity(item.receivedQuantity)} · Hỏng{' '}
                    {formatQuantity(item.damagedQuantity)} · Đã cất{' '}
                    {formatQuantity(item.putAwayQuantity)}
                  </ItemDescription>
                  {item.putAwayAssignedToName && (
                    <div className="mt-1">
                      <TaskAssigneeCell
                        assigneeName={item.putAwayAssignedToName}
                        executionStatus={item.putAwayExecutionStatus}
                      />
                    </div>
                  )}
                </ItemContent>
                {canApprove && item.status === 'PendingApproval' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isApproving}
                    onClick={() => onApprove(item)}
                  >
                    <Check aria-hidden="true" />
                    Phê duyệt
                  </Button>
                ) : null}
              </Item>
            ))}
          </ItemGroup>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10">Mã phiếu</TableHead>
                  <TableHead className="sticky top-0 z-10">Yêu cầu nhập kho</TableHead>
                  <TableHead className="sticky top-0 z-10">Kho</TableHead>
                  <TableHead className="sticky top-0 z-10">Trạng thái</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Mặt hàng</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Nhận / Hỏng</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Đã cất / Còn cất</TableHead>
                  <TableHead className="sticky top-0 z-10">Người cất hàng</TableHead>
                  <TableHead className="sticky top-0 z-10">Người tạo</TableHead>
                  <TableHead className="sticky top-0 z-10">Ngày tạo</TableHead>
                  <TableHead className="sticky top-0 z-10">
                    <span className="sr-only">Thao tác</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={APP_ROUTES.goodsReceiptDetail(item.id) as Route}
                        className="font-mono font-semibold hover:underline"
                      >
                        {item.receiptCode}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{item.inboundRequestCode}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>
                      <InboundStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.lineCount}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(item.receivedQuantity)} /{' '}
                      {formatQuantity(item.damagedQuantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(item.putAwayQuantity)} /{' '}
                      {formatQuantity(
                        Math.max(
                          0,
                          item.receivedQuantity - item.damagedQuantity - item.putAwayQuantity
                        )
                      )}
                    </TableCell>
                    <TableCell className="max-w-40">
                      <TaskAssigneeCell
                        assigneeName={item.putAwayAssignedToName}
                        assignedAt={item.putAwayAssignedAt}
                        executionStatus={item.putAwayExecutionStatus}
                      />
                    </TableCell>
                    <TableCell>{item.createdByName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatOperationalDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {canApprove && item.status === 'PendingApproval' ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Phê duyệt ${item.receiptCode}`}
                                disabled={isApproving}
                                onClick={() => onApprove(item)}
                              >
                                <Check className="text-primary" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Phê duyệt phiếu</TooltipContent>
                          </Tooltip>
                        ) : null}
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link
                            href={APP_ROUTES.goodsReceiptDetail(item.id) as Route}
                            aria-label={`Xem ${item.receiptCode}`}
                          >
                            <Eye aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
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
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </OperationalListPanel>
  )
}
