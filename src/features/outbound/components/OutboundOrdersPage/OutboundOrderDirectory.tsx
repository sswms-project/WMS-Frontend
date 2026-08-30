'use client'

import {
  Eye,
  ListFilter,
  MoreHorizontal,
  PackageMinus,
  Plus,
  RefreshCw,
  Search,
  Undo2,
} from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
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
import type { OutboundOrderStatus, OutboundOrderSummary } from '../../types/outbound.types'
import {
  canIssueStock,
  formatOutboundDate,
  formatOutboundQuantity,
  OUTBOUND_ORDER_STATUS_LABELS,
} from '../../utils/outbound-format'
import { OutboundOrderStatusBadge } from './OutboundOrderStatusBadge'

interface WarehouseOption {
  readonly id: string
  readonly name: string
}

interface OutboundOrderDirectoryProps {
  readonly items: readonly OutboundOrderSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: OutboundOrderStatus | ''
  readonly warehouseId: string
  readonly warehouseOptions: readonly WarehouseOption[]
  readonly permissions: readonly string[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: OutboundOrderStatus | '') => void
  readonly onWarehouseChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
  readonly onInspect: (order: OutboundOrderSummary) => void
  readonly onIssueStock: (order: OutboundOrderSummary) => void
}

export function OutboundOrderDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  warehouseId,
  warehouseOptions,
  permissions,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onStatusChange,
  onWarehouseChange,
  onPageChange,
  onRetry,
  onInspect,
  onIssueStock,
}: OutboundOrderDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const activeFilterCount = (status ? 1 : 0) + (warehouseId ? 1 : 0)

  const canIssue = permissions.includes('outbound-orders:issue')

  const renderRowActions = (order: OutboundOrderSummary) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Thao tác với đơn ${order.orderCode}`}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onInspect(order)}>
          <Eye className="size-4" aria-hidden="true" />
          Xem chi tiết
        </DropdownMenuItem>
        {canIssue && canIssueStock(order.status) ? (
          <DropdownMenuItem onSelect={() => onIssueStock(order)}>
            <Undo2 className="size-4" aria-hidden="true" />
            Lấy hàng &amp; xuất kho
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
            <h1 className="mt-0.5 text-xl font-semibold">Đơn xuất kho</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi đơn xuất từ lúc tạo, lấy hàng, đóng gói cho tới khi bàn giao vận chuyển.
            </p>
          </div>
        </div>
        {permissions.includes('outbound-orders:create') ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={APP_ROUTES.orderCreate as Route}>
              <Plus aria-hidden="true" />
              Tạo đơn xuất kho
            </Link>
          </Button>
        ) : null}
      </header>

      <section
        className="bg-card flex min-h-0 flex-col border"
        aria-labelledby="outbound-order-directory-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="outbound-order-directory-title" className="text-sm font-semibold">
              Danh sách đơn xuất
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">{totalCount} đơn</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm đơn xuất kho"
                placeholder="Tìm mã đơn, khách hàng, kho…"
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
          <OperationalErrorState title="Không thể tải đơn xuất kho" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có đơn xuất kho phù hợp"
            description="Thử đổi từ khóa, bộ lọc hoặc tạo đơn xuất kho đầu tiên."
          />
        ) : (
          <>
            <OutboundOrderMobileList items={items} renderRowActions={renderRowActions} />
            <OutboundOrderDesktopTable items={items} renderRowActions={renderRowActions} />
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
            <SheetTitle>Bộ lọc đơn xuất kho</SheetTitle>
            <SheetDescription>Thu hẹp danh sách theo trạng thái và kho xuất.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
            <Field>
              <FieldLabel htmlFor="outbound-order-filter-status">Trạng thái</FieldLabel>
              <NativeSelect
                id="outbound-order-filter-status"
                className="w-full"
                value={status}
                onChange={(event) => onStatusChange(event.target.value as OutboundOrderStatus | '')}
              >
                <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
                {Object.entries(OUTBOUND_ORDER_STATUS_LABELS).map(([value, label]) => (
                  <NativeSelectOption key={value} value={value}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="outbound-order-filter-warehouse">Kho xuất</FieldLabel>
              <NativeSelect
                id="outbound-order-filter-warehouse"
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

function totalOrderedQuantity(order: OutboundOrderSummary) {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

function totalPickedQuantity(order: OutboundOrderSummary) {
  return order.items.reduce((total, item) => total + item.pickedQuantity, 0)
}

function OutboundOrderMobileList({
  items,
  renderRowActions,
}: {
  readonly items: readonly OutboundOrderSummary[]
  readonly renderRowActions: (order: OutboundOrderSummary) => ReactNode
}) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <span className="max-w-full min-w-0 truncate font-mono font-semibold" translate="no">
                {item.orderCode}
              </span>
              <OutboundOrderStatusBadge status={item.status} />
            </ItemTitle>
            <ItemDescription>
              {item.customerName} · {item.warehouseName}
            </ItemDescription>
            <ItemDescription>
              {item.items.length} dòng · {formatOutboundQuantity(totalPickedQuantity(item))}/
              {formatOutboundQuantity(totalOrderedQuantity(item))} đơn vị ·{' '}
              {formatOutboundDate(item.createdAt)}
            </ItemDescription>
          </ItemContent>
          {renderRowActions(item)}
        </Item>
      ))}
    </ItemGroup>
  )
}

function OutboundOrderDesktopTable({
  items,
  renderRowActions,
}: {
  readonly items: readonly OutboundOrderSummary[]
  readonly renderRowActions: (order: OutboundOrderSummary) => ReactNode
}) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1040px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-56">Mã đơn</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-52">Khách hàng</TableHead>
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
                      {item.orderCode}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="font-mono" translate="no">
                    {item.orderCode}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="truncate">{item.customerName}</TableCell>
              <TableCell className="truncate">{item.warehouseName}</TableCell>
              <TableCell>
                <OutboundOrderStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{item.items.length}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatOutboundQuantity(totalPickedQuantity(item))}/
                {formatOutboundQuantity(totalOrderedQuantity(item))}
              </TableCell>
              <TableCell className="truncate">{formatOutboundDate(item.createdAt)}</TableCell>
              <TableCell className="text-right">{renderRowActions(item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
