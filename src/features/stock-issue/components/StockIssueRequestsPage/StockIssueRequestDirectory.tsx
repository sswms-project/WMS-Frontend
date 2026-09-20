'use client'

import {
  Eye,
  ListFilter,
  MoreHorizontal,
  PackageMinus,
  Plus,
  RefreshCw,
  Search,
  Send,
  Undo2,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { StockIssueWorkspaceNavigation } from '@/components/operations/StockIssueWorkspaceNavigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { APP_ROUTES } from '@/routes/app-routes'
import type {
  StockIssueRequestStatus,
  StockIssueRequestSummary,
} from '../../types/stock-issue.types'
import {
  canRecordStockPicking,
  formatStockIssueDate,
  formatStockIssueQuantity,
  STOCK_ISSUE_REQUEST_STATUS_LABELS,
} from '../../utils/stock-issue-format'
import { StockIssueRequestStatusBadge } from './StockIssueRequestStatusBadge'

interface WarehouseOption {
  readonly id: string
  readonly name: string
}

interface StockIssueRequestDirectoryProps {
  readonly items: readonly StockIssueRequestSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: StockIssueRequestStatus | ''
  readonly warehouseId: string
  readonly stockRecipientId: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly stockRecipientOptions: readonly { id: string; name: string }[]
  readonly warehouseOptions: readonly WarehouseOption[]
  readonly permissions: readonly string[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: StockIssueRequestStatus | '') => void
  readonly onWarehouseChange: (value: string) => void
  readonly onStockRecipientChange: (value: string) => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
  readonly onInspect: (order: StockIssueRequestSummary) => void
  readonly onRecordStockPicking: (order: StockIssueRequestSummary) => void
  readonly onAuthorizeDispatch: (order: StockIssueRequestSummary) => void
  readonly onConfirmDispatch: (order: StockIssueRequestSummary) => void
  readonly onCreateGoodsReturnRequest: (order: StockIssueRequestSummary) => void
}

export function StockIssueRequestDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  warehouseId,
  stockRecipientId,
  dateFrom,
  dateTo,
  stockRecipientOptions,
  warehouseOptions,
  permissions,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onStatusChange,
  onWarehouseChange,
  onStockRecipientChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onRetry,
  onInspect,
  onRecordStockPicking,
  onAuthorizeDispatch,
  onConfirmDispatch,
  onCreateGoodsReturnRequest,
}: StockIssueRequestDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const activeFilterCount =
    (status ? 1 : 0) +
    (warehouseId ? 1 : 0) +
    (stockRecipientId ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0)

  const canPick = permissions.includes('stock-issue-requests:pick')
  const canDispatch = permissions.includes('stock-issue-requests:dispatch')
  const canAuthorizeDispatch = permissions.includes('stock-issue-requests:authorize-dispatch')
  const canGoodsReturnRequest = permissions.includes('stock-issue-requests:return')

  const renderRowActions = (order: StockIssueRequestSummary) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Thao tác với đơn ${order.stockIssueRequestCode}`}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onInspect(order)}>
          <Eye className="size-4" aria-hidden="true" />
          Xem chi tiết
        </DropdownMenuItem>
        {canPick && canRecordStockPicking(order.status) ? (
          <DropdownMenuItem onSelect={() => onRecordStockPicking(order)}>
            <Undo2 className="size-4" aria-hidden="true" />
            Ghi nhận lấy hàng
          </DropdownMenuItem>
        ) : null}
        {canAuthorizeDispatch && order.status === 'Picked' ? (
          <DropdownMenuItem onSelect={() => onAuthorizeDispatch(order)}>
            <Send className="size-4" aria-hidden="true" />
            Cho phép xuất kho
          </DropdownMenuItem>
        ) : null}
        {canDispatch && order.status === 'AuthorizedForDispatch' ? (
          <DropdownMenuItem onSelect={() => onConfirmDispatch(order)}>
            <Send className="size-4" aria-hidden="true" />
            Xác nhận hàng rời kho
          </DropdownMenuItem>
        ) : null}
        {canGoodsReturnRequest && order.status === 'Dispatched' ? (
          <DropdownMenuItem onSelect={() => onCreateGoodsReturnRequest(order)}>
            <Undo2 className="size-4" aria-hidden="true" />
            Tạo yêu cầu trả hàng
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <PackageMinus aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Xuất kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Yêu cầu xuất kho</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi yêu cầu xuất kho từ lúc tạo, lấy hàng cho tới khi xác nhận hàng rời kho.
            </p>
          </div>
        </div>
        {permissions.includes('stock-issue-requests:create') ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={APP_ROUTES.stockIssueRequestCreate}>
              <Plus aria-hidden="true" />
              Tạo yêu cầu xuất kho
            </Link>
          </Button>
        ) : null}
      </header>

      <StockIssueWorkspaceNavigation currentView="stockIssueRequests" permissions={permissions} />

      <section
        className="bg-card flex min-h-0 flex-col border"
        aria-labelledby="stock-issue-request-directory-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="stock-issue-request-directory-title" className="text-sm font-semibold">
              Danh sách yêu cầu xuất kho
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">{totalCount} đơn</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm yêu cầu xuất kho"
                placeholder="Tìm mã yêu cầu, đơn vị nhận hàng, kho…"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </InputGroup>
            <Button type="button" variant="outline" onClick={() => setIsFilterOpen(true)}>
              <ListFilter aria-hidden="true" />
              Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Tải lại danh sách"
                  onClick={onRetry}
                >
                  <RefreshCw
                    className={isFetching ? 'animate-spin' : undefined}
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
          <OperationalErrorState title="Không thể tải yêu cầu xuất kho" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có yêu cầu xuất kho phù hợp"
            description="Thử đổi từ khóa, bộ lọc hoặc tạo yêu cầu xuất kho đầu tiên."
          />
        ) : (
          <>
            <StockIssueRequestMobileList items={items} renderRowActions={renderRowActions} />
            <StockIssueRequestDesktopTable items={items} renderRowActions={renderRowActions} />
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

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Bộ lọc yêu cầu xuất kho</SheetTitle>
            <SheetDescription>Thu hẹp danh sách theo trạng thái và kho xuất.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
            <Field>
              <FieldLabel htmlFor="stock-issue-request-filter-status">Trạng thái</FieldLabel>
              <NativeSelect
                id="stock-issue-request-filter-status"
                className="w-full"
                value={status}
                onChange={(event) =>
                  onStatusChange(event.target.value as StockIssueRequestStatus | '')
                }
              >
                <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
                {Object.entries(STOCK_ISSUE_REQUEST_STATUS_LABELS).map(([value, label]) => (
                  <NativeSelectOption key={value} value={value}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="stock-issue-request-filter-warehouse">Kho xuất</FieldLabel>
              <NativeSelect
                id="stock-issue-request-filter-warehouse"
                className="w-full"
                value={warehouseId}
                onChange={(event) => onWarehouseChange(event.target.value)}
              >
                <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
                {warehouseOptions.map((warehouse) => (
                  <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="stock-issue-request-filter-stockRecipient">
                Đơn vị nhận hàng
              </FieldLabel>
              <NativeSelect
                id="stock-issue-request-filter-stockRecipient"
                value={stockRecipientId}
                onChange={(event) => onStockRecipientChange(event.target.value)}
              >
                <NativeSelectOption value="">Tất cả đơn vị nhận hàng</NativeSelectOption>
                {stockRecipientOptions.map((stockRecipient) => (
                  <NativeSelectOption key={stockRecipient.id} value={stockRecipient.id}>
                    {stockRecipient.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="outbound-date-from">Từ ngày</FieldLabel>
                <Input
                  id="outbound-date-from"
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(event) => onDateFromChange(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="outbound-date-to">Đến ngày</FieldLabel>
                <Input
                  id="outbound-date-to"
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(event) => onDateToChange(event.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          <SheetFooter>
            <Button type="button" onClick={() => setIsFilterOpen(false)}>
              Xem kết quả
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onStatusChange('')
                onWarehouseChange('')
                onStockRecipientChange('')
                onDateFromChange('')
                onDateToChange('')
              }}
            >
              Đặt lại
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function totalOrderedQuantity(order: StockIssueRequestSummary) {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

function totalPickedQuantity(order: StockIssueRequestSummary) {
  return order.items.reduce((total, item) => total + item.pickedQuantity, 0)
}

function StockIssueRequestMobileList({
  items,
  renderRowActions,
}: {
  readonly items: readonly StockIssueRequestSummary[]
  readonly renderRowActions: (order: StockIssueRequestSummary) => ReactNode
}) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <span className="max-w-full min-w-0 truncate font-mono font-semibold" translate="no">
                {item.stockIssueRequestCode}
              </span>
              <StockIssueRequestStatusBadge status={item.status} />
            </ItemTitle>
            <ItemDescription>
              {item.recipientName} · {item.warehouseName}
            </ItemDescription>
            <ItemDescription>
              {item.items.length} dòng · {formatStockIssueQuantity(totalPickedQuantity(item))}/
              {formatStockIssueQuantity(totalOrderedQuantity(item))} đơn vị ·{' '}
              {formatStockIssueDate(item.createdAt)}
            </ItemDescription>
          </ItemContent>
          {renderRowActions(item)}
        </Item>
      ))}
    </ItemGroup>
  )
}

function StockIssueRequestDesktopTable({
  items,
  renderRowActions,
}: {
  readonly items: readonly StockIssueRequestSummary[]
  readonly renderRowActions: (order: StockIssueRequestSummary) => ReactNode
}) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1040px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-56">Mã đơn</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-52">Đơn vị nhận hàng</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-52">Kho xuất</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-40">Trạng thái</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-24 text-right">Số dòng</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36 text-right">Đã lấy/Đặt</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-44">Ngày tạo</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-12">
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block truncate font-mono font-semibold" translate="no">
                      {item.stockIssueRequestCode}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="font-mono" translate="no">
                    {item.stockIssueRequestCode}
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground block truncate text-xs">
                  {item.purpose ?? 'Không có mục đích'}
                </span>
              </TableCell>
              <TableCell className="min-w-0">
                <span className="block truncate">{item.recipientName}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  Nhận: {item.recipientName}
                </span>
              </TableCell>
              <TableCell className="truncate">{item.warehouseName}</TableCell>
              <TableCell>
                <StockIssueRequestStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{item.items.length}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatStockIssueQuantity(totalPickedQuantity(item))}/
                {formatStockIssueQuantity(totalOrderedQuantity(item))}
              </TableCell>
              <TableCell className="truncate">{formatStockIssueDate(item.createdAt)}</TableCell>
              <TableCell className="text-right">{renderRowActions(item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
