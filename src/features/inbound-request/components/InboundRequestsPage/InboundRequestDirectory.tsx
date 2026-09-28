'use client'

import { ClipboardList, Copy, Eye, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import {
  OperationalEmptyState,
  OperationalErrorState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'
import { inboundSourceLabels } from '../../schemas/inbound-request.schema'
import {
  INBOUND_REQUEST_STATUS,
  type InboundRequestStatus,
  type InboundRequestSummary,
} from '../../types/inbound-request.types'
import {
  formatOperationalDate,
  formatQuantity,
  INBOUND_REQUEST_STATUS_LABELS,
} from '../../utils/inbound-request-format'
import { InboundRequestStatusBadge } from './InboundRequestStatusBadge'

interface InboundRequestDirectoryProps {
  readonly items: readonly InboundRequestSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: InboundRequestStatus | ''
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly canDelete: boolean
  readonly canCreate: boolean
  readonly isDeleting: boolean
  readonly isDuplicating: boolean
  readonly selectedIds: readonly string[]
  readonly isDeletingMany: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: InboundRequestStatus | '') => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRetry: () => void
  readonly onDelete: (item: InboundRequestSummary) => void
  readonly onDuplicate: (item: InboundRequestSummary) => void
  readonly onSelectionChange: (ids: readonly string[]) => void
  readonly onDeleteMany: () => void
}

export function InboundRequestDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  isLoading,
  isFetching,
  isError,
  canDelete,
  canCreate,
  isDeleting,
  isDuplicating,
  selectedIds,
  isDeletingMany,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onDelete,
  onDuplicate,
  onSelectionChange,
  onDeleteMany,
}: InboundRequestDirectoryProps) {
  const selectableItems = canDelete
    ? items.filter((item) => item.status === INBOUND_REQUEST_STATUS.Draft)
    : []
  const allSelected =
    selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id))
  const someSelected = selectedIds.length > 0
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <ClipboardList aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Nhập kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Yêu cầu nhập kho</h1>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={APP_ROUTES.inboundRequestCreate as Route}>
            <Plus aria-hidden="true" />
            Tạo yêu cầu nhập kho
          </Link>
        </Button>
      </header>

      <OperationalListPanel aria-labelledby="po-directory-title">
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="po-directory-title" className="text-sm font-semibold">
              Danh sách yêu cầu nhập kho
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">{totalCount} đơn</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search className="text-primary" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm yêu cầu nhập kho"
                placeholder="Tìm mã yêu cầu, nguồn hàng…"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </InputGroup>
            <NativeSelect
              aria-label="Lọc theo trạng thái"
              className="min-w-36"
              value={status}
              onChange={(event) => onStatusChange(event.target.value as InboundRequestStatus | '')}
            >
              <NativeSelectOption value="">Mọi trạng thái</NativeSelectOption>
              {Object.entries(INBOUND_REQUEST_STATUS_LABELS).map(([value, label]) => (
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
                  aria-label="Tải lại danh sách"
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
            {canDelete ? (
              <>
                <span className="text-sm whitespace-nowrap">
                  Đã chọn <strong>{selectedIds.length}</strong>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!someSelected || isDeletingMany}
                  onClick={() => onSelectionChange([])}
                >
                  Bỏ chọn
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!someSelected || isDeletingMany}
                  onClick={onDeleteMany}
                >
                  <Trash2 aria-hidden="true" />
                  {isDeletingMany ? 'Đang xoá…' : 'Xoá'}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <InboundRequestTableSkeleton />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải yêu cầu nhập kho" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có yêu cầu nhập kho phù hợp"
            description="Thử đổi từ khóa, bộ lọc hoặc tạo yêu cầu nhập kho đầu tiên."
          />
        ) : (
          <>
            <div data-slot="operational-list-body" className="md:hidden">
              <InboundRequestMobileList
                items={items}
                canCreate={canCreate}
                isDuplicating={isDuplicating}
                onDuplicate={onDuplicate}
              />
            </div>
            <InboundRequestDesktopTable
              items={items}
              canDelete={canDelete}
              canCreate={canCreate}
              isDeleting={isDeleting}
              isDuplicating={isDuplicating}
              selectedIds={selectedIds}
              allSelected={allSelected}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onSelectionChange={onSelectionChange}
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
    </div>
  )
}

function receivedPercent(item: InboundRequestSummary) {
  return item.orderedQuantity <= 0
    ? 0
    : Math.min(100, (item.receivedQuantity / item.orderedQuantity) * 100)
}

function InboundRequestTableSkeleton() {
  return (
    <div className="flex-1 overflow-hidden" aria-label="Đang tải danh sách yêu cầu nhập kho">
      <Table className="min-w-[1120px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-10 w-12">
              <Skeleton className="size-4" />
            </TableHead>
            {[
              'Mã yêu cầu',
              'Nguồn hàng',
              'Kho nhận',
              'Trạng thái',
              'Tiến độ nhận',
              'Ngày dự kiến',
              'Thao tác',
            ].map((heading) => (
              <TableHead key={heading} className="sticky top-0 z-10">
                {heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="size-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-2 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto size-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function InboundRequestMobileList({
  items,
  canCreate,
  isDuplicating,
  onDuplicate,
}: {
  readonly items: readonly InboundRequestSummary[]
  readonly canCreate: boolean
  readonly isDuplicating: boolean
  readonly onDuplicate: (item: InboundRequestSummary) => void
}) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <Link
                href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                className="text-primary max-w-full min-w-0 truncate font-mono font-semibold underline-offset-4 hover:underline"
                translate="no"
              >
                {item.inboundRequestCode}
              </Link>
              <InboundRequestStatusBadge status={item.status} />
              {canCreate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Sao chép ${item.inboundRequestCode}`}
                  disabled={isDuplicating}
                  onClick={() => onDuplicate(item)}
                >
                  <Copy className="text-primary" aria-hidden="true" />
                </Button>
              ) : null}
            </ItemTitle>
            <ItemDescription>
              <Link
                href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                className="hover:text-primary"
              >
                {item.supplierName ?? item.sourceName ?? 'Chưa xác định nguồn'} ·{' '}
                {item.warehouseName ?? 'Chưa xác định kho'}
              </Link>
            </ItemDescription>
            <ItemDescription>
              <Link
                href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                className="hover:text-primary"
              >
                {formatQuantity(item.receivedQuantity)} / {formatQuantity(item.orderedQuantity)} đã
                nhận · {formatOperationalDate(item.expectedDate)}
              </Link>
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

function InboundRequestDesktopTable({
  items,
  canDelete,
  canCreate,
  isDeleting,
  isDuplicating,
  selectedIds,
  allSelected,
  onDelete,
  onDuplicate,
  onSelectionChange,
}: {
  readonly items: readonly InboundRequestSummary[]
  readonly canDelete: boolean
  readonly canCreate: boolean
  readonly isDeleting: boolean
  readonly isDuplicating: boolean
  readonly selectedIds: readonly string[]
  readonly allSelected: boolean
  readonly onDelete: (item: InboundRequestSummary) => void
  readonly onDuplicate: (item: InboundRequestSummary) => void
  readonly onSelectionChange: (ids: readonly string[]) => void
}) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1120px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-10 w-12">
              <Checkbox
                aria-label="Chọn tất cả phiếu nháp trên trang"
                checked={allSelected}
                disabled={
                  !canDelete || !items.some((item) => item.status === INBOUND_REQUEST_STATUS.Draft)
                }
                onCheckedChange={(checked) =>
                  onSelectionChange(
                    checked
                      ? items
                          .filter((item) => item.status === INBOUND_REQUEST_STATUS.Draft)
                          .map((item) => item.id)
                      : []
                  )
                }
              />
            </TableHead>
            <TableHead className="sticky top-0 z-10 w-64">Mã yêu cầu</TableHead>
            <TableHead className="sticky top-0 z-10 w-44">Nguồn hàng</TableHead>
            <TableHead className="sticky top-0 z-10 w-40">Kho nhận</TableHead>
            <TableHead className="sticky top-0 z-10 w-32">Trạng thái</TableHead>
            <TableHead className="sticky top-0 z-10 w-36">Tiến độ nhận</TableHead>
            <TableHead className="sticky top-0 z-10 w-32">Ngày dự kiến</TableHead>
            <TableHead className="sticky top-0 z-10 w-24">
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.status === INBOUND_REQUEST_STATUS.Draft ? (
                  <Checkbox
                    aria-label={`Chọn ${item.inboundRequestCode}`}
                    checked={selectedIds.includes(item.id)}
                    disabled={!canDelete}
                    onCheckedChange={(checked) =>
                      onSelectionChange(
                        checked
                          ? [...selectedIds, item.id]
                          : selectedIds.filter((id) => id !== item.id)
                      )
                    }
                  />
                ) : null}
              </TableCell>
              <TableCell className="min-w-0">
                <div className="min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                        className="text-primary block truncate font-mono font-semibold underline-offset-4 hover:underline"
                        translate="no"
                      >
                        {item.inboundRequestCode}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono" translate="no">
                      {item.inboundRequestCode}
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-muted-foreground truncate text-xs">{item.createdByName}</p>
                </div>
              </TableCell>
              <TableCell className="min-w-0">
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block min-w-0"
                >
                  <p className="truncate">
                    {item.supplierName ?? item.sourceName ?? 'Chưa xác định'}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {inboundSourceLabels[item.sourceType]}
                  </p>
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block truncate"
                >
                  {item.warehouseName ?? 'Chưa xác định'}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  aria-label={`Xem yêu cầu ${item.inboundRequestCode}, trạng thái ${INBOUND_REQUEST_STATUS_LABELS[item.status]}`}
                >
                  <InboundRequestStatusBadge status={item.status} />
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary flex flex-col gap-1"
                  aria-label={`Xem tiến độ nhận của ${item.inboundRequestCode}`}
                >
                  <span className="text-xs tabular-nums">
                    {formatQuantity(item.receivedQuantity)} / {formatQuantity(item.orderedQuantity)}
                  </span>
                  <Progress value={receivedPercent(item)} />
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block"
                >
                  {formatOperationalDate(item.expectedDate)}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                          aria-label={`Xem ${item.inboundRequestCode}`}
                        >
                          <Eye className="text-primary" aria-hidden="true" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Xem chi tiết</TooltipContent>
                  </Tooltip>
                  {canCreate ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Sao chép ${item.inboundRequestCode}`}
                          disabled={isDuplicating}
                          onClick={() => onDuplicate(item)}
                        >
                          <Copy className="text-primary" aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sao chép yêu cầu</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {canDelete && item.status === INBOUND_REQUEST_STATUS.Draft ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Xoá ${item.inboundRequestCode}`}
                          disabled={isDeleting}
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 aria-hidden="true" className="text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xoá bản nháp</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
