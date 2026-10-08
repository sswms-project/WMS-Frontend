'use client'

import { Eye, ListFilter, MoreHorizontal, PencilLine, Plus, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  formatOperationalDate,
  formatOperationalDateTime,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import { goodsPreviewInteractions } from '@/features/inbound/utils/goods-preview-interactions'
import { APP_ROUTES } from '@/routes/app-routes'
import type { TransferStatus, TransferSummary } from '../../types/transfer.types'
import {
  TransferFlagBadges,
  TransferProgressText,
  TransferStatusBadge,
} from './TransferStatusBadge'
import { transferTabIds } from '../../utils/transfer-tabs'

const ALL_STATUSES_TAB = 'All'

export const TRANSFER_STATUS_TABS: ReadonlyArray<{
  value: TransferStatus | typeof ALL_STATUSES_TAB
  label: string
}> = [
  { value: 'Draft', label: 'Nháp' },
  { value: 'InProgress', label: 'Đang thực hiện' },
  { value: 'AwaitingResolution', label: 'Chờ xử lý chênh lệch' },
  { value: 'Completed', label: 'Hoàn tất' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: ALL_STATUSES_TAB, label: 'Tất cả' },
]

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
  readonly previewId?: string
  readonly canCreate: boolean
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
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRetry: () => void
  readonly onPreview: (transfer: TransferSummary) => void
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
  previewId,
  canCreate,
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
  onPageSizeChange,
  onRetry,
  onPreview,
}: TransferDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const tabIds = transferTabIds(useId(), status || ALL_STATUSES_TAB)
  const activeFilterCount =
    (sourceWarehouseId ? 1 : 0) +
    (destinationWarehouseId ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0)

  const renderRowActions = (transfer: TransferSummary): ReactNode => {
    const canOpenDraft =
      canCreate && transfer.status === 'Draft' && transfer.createdBy === currentUserId
    return (
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
          <DropdownMenuItem asChild>
            <Link href={APP_ROUTES.transferDetail(transfer.id)}>
              <Eye className="size-4" aria-hidden="true" />
              Xem chi tiết
            </Link>
          </DropdownMenuItem>
          {canOpenDraft ? (
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.transferEdit(transfer.id)}>
                <PencilLine className="size-4" aria-hidden="true" />
                Soạn tiếp nháp
              </Link>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3">
      <header className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="sr-only">Điều chuyển kho</h1>
        <Tabs
          value={status || ALL_STATUSES_TAB}
          onValueChange={(value) => {
            const tab = TRANSFER_STATUS_TABS.find((candidate) => candidate.value === value)
            if (tab) onStatusChange(tab.value === ALL_STATUSES_TAB ? '' : tab.value)
          }}
          className="min-w-0 flex-1 overflow-x-auto"
        >
          <TabsList variant="workspace" aria-label="Lọc phiếu theo trạng thái">
            {TRANSFER_STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                id={tabIds.tabId(tab.value)}
                aria-controls={tabIds.panelId}
                className="flex-none px-3 py-1.5"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {canCreate ? (
          <Button asChild size="sm" className="shrink-0">
            <Link href={APP_ROUTES.transferCreate}>
              <Plus aria-hidden="true" />
              Tạo yêu cầu điều chuyển
            </Link>
          </Button>
        ) : null}
      </header>

      <OperationalListPanel {...tabIds.panelProps}>
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold">
            {TRANSFER_STATUS_TABS.find((tab) => tab.value === (status || ALL_STATUSES_TAB))?.label}
          </h2>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm phiếu điều chuyển"
                placeholder="Tìm mã phiếu, kho xuất, kho nhập…"
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
            description="Thử đổi tab, từ khóa, bộ lọc hoặc tạo yêu cầu điều chuyển mới."
          />
        ) : (
          <>
            <TransferMobileList
              items={items}
              previewId={previewId}
              onPreview={onPreview}
              renderRowActions={renderRowActions}
            />
            <TransferDesktopTable
              items={items}
              previewId={previewId}
              onPreview={onPreview}
              renderRowActions={renderRowActions}
            />
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

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Bộ lọc phiếu điều chuyển</SheetTitle>
            <SheetDescription>Thu hẹp danh sách theo kho và ngày tạo.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
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
              <FieldLabel htmlFor="transfer-filter-destination">Kho nhập</FieldLabel>
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

interface TransferListPartProps {
  readonly items: readonly TransferSummary[]
  readonly previewId?: string
  readonly onPreview: (transfer: TransferSummary) => void
  readonly renderRowActions: (transfer: TransferSummary) => ReactNode
}

function TransferMobileList({
  items,
  previewId,
  onPreview,
  renderRowActions,
}: TransferListPartProps) {
  return (
    <div data-slot="operational-list-body" className="md:hidden">
      <ItemGroup className="gap-0">
        {items.map((item) => (
          <Item
            key={item.id}
            {...goodsPreviewInteractions(
              () => onPreview(item),
              previewId === item.id,
              'border-b last:border-b-0'
            )}
          >
            <ItemContent className="min-w-0">
              <ItemTitle className="flex flex-wrap items-center gap-2">
                <Link
                  href={APP_ROUTES.transferDetail(item.id)}
                  className="max-w-full min-w-0 truncate font-mono font-semibold underline-offset-4 hover:underline"
                  translate="no"
                >
                  {item.transferCode}
                </Link>
                <TransferStatusBadge status={item.status} />
              </ItemTitle>
              <ItemDescription>
                {item.sourceWarehouseName} → {item.destinationWarehouseName}
              </ItemDescription>
              <ItemDescription>
                {item.lineCount} dòng · {formatQuantity(item.requestedQuantity)} đơn vị ·{' '}
                {formatOperationalDateTime(item.createdAt)}
              </ItemDescription>
              <TransferFlagBadges
                hasOpenFeedback={item.hasOpenFeedback}
                hasPendingPickEscalation={item.hasPendingPickEscalation}
              />
            </ItemContent>
            {renderRowActions(item)}
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}

function TransferDesktopTable({
  items,
  previewId,
  onPreview,
  renderRowActions,
}: TransferListPartProps) {
  return (
    <div data-slot="operational-list-body" className="hidden md:block">
      <Table className="min-w-[1280px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Mã phiếu</TableHead>
            <TableHead className="w-44">Ngày tạo</TableHead>
            <TableHead className="w-72">Kho xuất → Kho nhập</TableHead>
            <TableHead className="w-36">Hạn cần hàng</TableHead>
            <TableHead className="w-40">Trạng thái</TableHead>
            <TableHead className="w-36">Tình trạng thực hiện</TableHead>
            <TableHead className="w-64">Cần chú ý</TableHead>
            <TableHead className="w-40">Người tạo</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              {...goodsPreviewInteractions(() => onPreview(item), previewId === item.id)}
            >
              <TableCell className="font-mono font-semibold" translate="no">
                <Link
                  href={APP_ROUTES.transferDetail(item.id)}
                  className="underline-offset-4 hover:underline"
                >
                  {item.transferCode}
                </Link>
              </TableCell>
              <TableCell>{formatOperationalDateTime(item.createdAt)}</TableCell>
              <TableCell className="whitespace-normal">
                {item.sourceWarehouseName} → {item.destinationWarehouseName}
              </TableCell>
              <TableCell>
                {item.requiredBy ? formatOperationalDate(item.requiredBy) : '—'}
              </TableCell>
              <TableCell>
                <TransferStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <TransferProgressText
                  dispatch={item.dispatchProgress}
                  receive={item.receiveProgress}
                />
              </TableCell>
              <TableCell>
                <TransferFlagBadges
                  hasOpenFeedback={item.hasOpenFeedback}
                  hasPendingPickEscalation={item.hasPendingPickEscalation}
                />
              </TableCell>
              <TableCell className="truncate">{item.createdByName ?? '—'}</TableCell>
              <TableCell className="text-right" data-preview-ignore>
                {renderRowActions(item)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
