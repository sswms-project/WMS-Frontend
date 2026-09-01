'use client'

import {
  ArrowLeftRight,
  Check,
  Eye,
  ListFilter,
  MoreHorizontal,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Truck,
  X,
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
import type { TransferStatus, TransferSummary } from '../../types/transfer.types'
import {
  canApproveTransfer,
  canDispatchTransfer,
  canReceiveTransfer,
  formatTransferDate,
  formatTransferQuantity,
  TRANSFER_STATUS_LABELS,
} from '../../utils/transfer-format'
import { TransferStatusBadge } from './TransferStatusBadge'

interface WarehouseOption {
  readonly id: string
  readonly name: string
}

interface TransferDirectoryProps {
  readonly items: readonly TransferSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: TransferStatus | ''
  readonly sourceWarehouseId: string
  readonly destinationWarehouseId: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly warehouseOptions: readonly WarehouseOption[]
  readonly permissions: readonly string[]
  readonly currentUserId: string | null
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: TransferStatus | '') => void
  readonly onSourceWarehouseChange: (value: string) => void
  readonly onDestinationWarehouseChange: (value: string) => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
  readonly onInspect: (transfer: TransferSummary) => void
  readonly onApprove: (transfer: TransferSummary) => void
  readonly onReject: (transfer: TransferSummary) => void
  readonly onDispatch: (transfer: TransferSummary) => void
  readonly onReceive: (transfer: TransferSummary) => void
}

export function TransferDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  sourceWarehouseId,
  destinationWarehouseId,
  dateFrom,
  dateTo,
  warehouseOptions,
  permissions,
  currentUserId,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onStatusChange,
  onSourceWarehouseChange,
  onDestinationWarehouseChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onRetry,
  onInspect,
  onApprove,
  onReject,
  onDispatch,
  onReceive,
}: TransferDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const activeFilterCount =
    (status ? 1 : 0) +
    (sourceWarehouseId ? 1 : 0) +
    (destinationWarehouseId ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0)

  const canApprove = permissions.includes('transfers:approve')
  const canDispatch = permissions.includes('transfers:dispatch')
  const canReceive = permissions.includes('transfers:receive')

  const renderRowActions = (transfer: TransferSummary) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Thao tác với phiếu ${transfer.transferCode}`}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onInspect(transfer)}>
          <Eye className="size-4" aria-hidden="true" />
          Xem chi tiết
        </DropdownMenuItem>
        {canApprove &&
        transfer.createdBy !== currentUserId &&
        canApproveTransfer(transfer.status) ? (
          <DropdownMenuItem onSelect={() => onApprove(transfer)}>
            <Check className="size-4" aria-hidden="true" />
            Duyệt phiếu
          </DropdownMenuItem>
        ) : null}
        {canApprove &&
        transfer.createdBy !== currentUserId &&
        canApproveTransfer(transfer.status) ? (
          <DropdownMenuItem variant="destructive" onSelect={() => onReject(transfer)}>
            <X className="size-4" aria-hidden="true" />
            Từ chối phiếu
          </DropdownMenuItem>
        ) : null}
        {canDispatch && canDispatchTransfer(transfer.status) ? (
          <DropdownMenuItem onSelect={() => onDispatch(transfer)}>
            <Truck className="size-4" aria-hidden="true" />
            Xuất hàng đi
          </DropdownMenuItem>
        ) : null}
        {canReceive && canReceiveTransfer(transfer.status) ? (
          <DropdownMenuItem onSelect={() => onReceive(transfer)}>
            <PackageCheck className="size-4" aria-hidden="true" />
            Xác nhận nhận hàng
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
            <ArrowLeftRight aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Điều chuyển</p>
            <h1 className="mt-0.5 text-xl font-semibold">Phiếu điều chuyển kho</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi phiếu điều chuyển từ lúc tạo, duyệt, xuất hàng cho tới khi kho nhận xác nhận.
            </p>
          </div>
        </div>
        {permissions.includes('transfers:create') ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={APP_ROUTES.transferCreate}>
              <Plus aria-hidden="true" />
              Tạo phiếu điều chuyển
            </Link>
          </Button>
        ) : null}
      </header>

      <section
        className="bg-card flex min-h-0 flex-col border"
        aria-labelledby="transfer-directory-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="transfer-directory-title" className="text-sm font-semibold">
              Danh sách phiếu
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">{totalCount} phiếu</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm phiếu điều chuyển"
                placeholder="Tìm mã phiếu, kho xuất, kho nhận…"
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
          <OperationalErrorState title="Không thể tải phiếu điều chuyển" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có phiếu điều chuyển phù hợp"
            description="Thử đổi từ khóa, bộ lọc hoặc tạo phiếu điều chuyển đầu tiên."
          />
        ) : (
          <>
            <TransferMobileList items={items} renderRowActions={renderRowActions} />
            <TransferDesktopTable items={items} renderRowActions={renderRowActions} />
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
            <SheetTitle>Bộ lọc phiếu điều chuyển</SheetTitle>
            <SheetDescription>Thu hẹp danh sách theo trạng thái và kho.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
            <Field>
              <FieldLabel htmlFor="transfer-filter-status">Trạng thái</FieldLabel>
              <NativeSelect
                id="transfer-filter-status"
                className="w-full"
                value={status}
                onChange={(event) => onStatusChange(event.target.value as TransferStatus | '')}
              >
                <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
                {Object.entries(TRANSFER_STATUS_LABELS).map(([value, label]) => (
                  <NativeSelectOption key={value} value={value}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="transfer-filter-source">Kho xuất</FieldLabel>
              <NativeSelect
                id="transfer-filter-source"
                className="w-full"
                value={sourceWarehouseId}
                onChange={(event) => onSourceWarehouseChange(event.target.value)}
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
              <FieldLabel htmlFor="transfer-filter-destination">Kho nhận</FieldLabel>
              <NativeSelect
                id="transfer-filter-destination"
                className="w-full"
                value={destinationWarehouseId}
                onChange={(event) => onDestinationWarehouseChange(event.target.value)}
              >
                <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
                {warehouseOptions.map((warehouse) => (
                  <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="transfer-date-from">Từ ngày</FieldLabel>
                <Input
                  id="transfer-date-from"
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(event) => onDateFromChange(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="transfer-date-to">Đến ngày</FieldLabel>
                <Input
                  id="transfer-date-to"
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
                onSourceWarehouseChange('')
                onDestinationWarehouseChange('')
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

function totalTransferQuantity(transfer: TransferSummary) {
  return transfer.items.reduce((total, item) => total + item.quantity, 0)
}

function TransferMobileList({
  items,
  renderRowActions,
}: {
  readonly items: readonly TransferSummary[]
  readonly renderRowActions: (transfer: TransferSummary) => ReactNode
}) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <span className="max-w-full min-w-0 truncate font-mono font-semibold" translate="no">
                {item.transferCode}
              </span>
              <TransferStatusBadge status={item.status} />
            </ItemTitle>
            <ItemDescription>
              {item.sourceWarehouseName} → {item.destinationWarehouseName}
            </ItemDescription>
            <ItemDescription>
              {item.items.length} dòng · {formatTransferQuantity(totalTransferQuantity(item))} đơn
              vị · {formatTransferDate(item.createdAt)}
            </ItemDescription>
          </ItemContent>
          {renderRowActions(item)}
        </Item>
      ))}
    </ItemGroup>
  )
}

function TransferDesktopTable({
  items,
  renderRowActions,
}: {
  readonly items: readonly TransferSummary[]
  readonly renderRowActions: (transfer: TransferSummary) => ReactNode
}) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1040px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-56">Mã phiếu</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-52">Kho xuất</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-52">Kho nhận</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36">Trạng thái</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-24 text-right">Số dòng</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Tổng SL</TableHead>
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
                      {item.transferCode}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="font-mono" translate="no">
                    {item.transferCode}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="truncate">{item.sourceWarehouseName}</TableCell>
              <TableCell className="truncate">{item.destinationWarehouseName}</TableCell>
              <TableCell>
                <TransferStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{item.items.length}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatTransferQuantity(totalTransferQuantity(item))}
              </TableCell>
              <TableCell className="truncate">{formatTransferDate(item.createdAt)}</TableCell>
              <TableCell className="text-right">{renderRowActions(item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
