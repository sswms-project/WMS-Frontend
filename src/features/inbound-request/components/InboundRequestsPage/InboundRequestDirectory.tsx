'use client'

import {
  ClipboardList,
  Copy,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Send,
  Check,
  Trash2,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
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
  type InboundRequestStatusCount,
  type InboundRequestSummary,
} from '../../types/inbound-request.types'
import {
  formatOperationalDate,
  formatOperationalDateTime,
  formatQuantity,
  INBOUND_REQUEST_STATUS_LABELS,
} from '../../utils/inbound-request-format'
import { InboundRequestStatusBadge } from './InboundRequestStatusBadge'
import { InboundRequestBulkActions } from './InboundRequestBulkActions'
import { InboundRequestStatusStats } from './InboundRequestStatusStats'

interface InboundRequestDirectoryProps {
  readonly items: readonly InboundRequestSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: InboundRequestStatus | ''
  readonly createdFrom: string
  readonly createdTo: string
  readonly statusCounts: readonly InboundRequestStatusCount[]
  readonly isLoading: boolean
  readonly isStatsError: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly canDelete: boolean
  readonly canCreate: boolean
  readonly canSubmit: boolean
  readonly canApprove: boolean
  readonly isDeleting: boolean
  readonly isSubmitting: boolean
  readonly isApproving: boolean
  readonly isDuplicating: boolean
  readonly selectedIds: readonly string[]
  readonly isDeletingMany: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: InboundRequestStatus | '') => void
  readonly onCreatedFromChange: (value: string) => void
  readonly onCreatedToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRetry: () => void
  readonly onDelete: (item: InboundRequestSummary) => void
  readonly onSubmit: (item: InboundRequestSummary) => void
  readonly onApprove: (item: InboundRequestSummary) => void
  readonly onDuplicate: (item: InboundRequestSummary) => void
  readonly onSelectionChange: (ids: readonly string[]) => void
  readonly onDeleteMany: (ids: readonly string[]) => void
  readonly onSubmitMany: (ids: readonly string[]) => void
  readonly onApproveMany: (ids: readonly string[]) => void
}

export function InboundRequestDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  createdFrom,
  createdTo,
  statusCounts,
  isLoading,
  isStatsError,
  isFetching,
  isError,
  canDelete,
  canCreate,
  canSubmit,
  canApprove,
  isDeleting,
  isSubmitting,
  isApproving,
  isDuplicating,
  selectedIds,
  isDeletingMany,
  onSearchChange,
  onStatusChange,
  onCreatedFromChange,
  onCreatedToChange,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onDelete,
  onSubmit,
  onApprove,
  onDuplicate,
  onSelectionChange,
  onDeleteMany,
  onSubmitMany,
  onApproveMany,
}: InboundRequestDirectoryProps) {
  const selectableItems = items.filter(
    (item) =>
      (item.status === INBOUND_REQUEST_STATUS.Draft && (canDelete || canSubmit)) ||
      (item.status === INBOUND_REQUEST_STATUS.PendingApproval && canApprove)
  )
  const selectedStatus = items.find((item) => selectedIds.includes(item.id))?.status ?? null
  const headerSelectionStatus =
    selectedStatus ??
    selectableItems.find((item) => item.status === INBOUND_REQUEST_STATUS.Draft)?.status ??
    selectableItems[0]?.status ??
    null
  const selectAllIds = selectableItems
    .filter((item) => item.status === headerSelectionStatus)
    .map((item) => item.id)
  const selectedIdsForStatus = selectedStatus
    ? selectedIds.filter((id) =>
        items.some((item) => item.id === id && item.status === selectedStatus)
      )
    : []
  const selectedDraftIds =
    selectedStatus === INBOUND_REQUEST_STATUS.Draft ? selectedIdsForStatus : []
  const selectedPendingIds =
    selectedStatus === INBOUND_REQUEST_STATUS.PendingApproval ? selectedIdsForStatus : []
  const allSelected =
    selectAllIds.length > 0 && selectAllIds.every((id) => selectedIds.includes(id))
  const hasSelectionActions = canDelete || canSubmit || canApprove
  const showDraftActions =
    headerSelectionStatus === INBOUND_REQUEST_STATUS.Draft && (canSubmit || canDelete)
  const showApproveAction =
    headerSelectionStatus === INBOUND_REQUEST_STATUS.PendingApproval && canApprove
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
        {canCreate ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={APP_ROUTES.inboundRequestCreate as Route}>
              <Plus aria-hidden="true" />
              Tạo yêu cầu nhập kho
            </Link>
          </Button>
        ) : null}
      </header>

      <InboundRequestStatusStats
        counts={statusCounts}
        isLoading={isLoading}
        isError={isStatsError}
      />

      <OperationalListPanel aria-labelledby="inbound-request-directory-title">
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="inbound-request-directory-title" className="text-sm font-semibold">
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
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              Tạo từ
              <Input
                type="date"
                aria-label="Lọc từ ngày tạo"
                className="w-36"
                value={createdFrom}
                max={createdTo || undefined}
                onChange={(event) => onCreatedFromChange(event.target.value)}
              />
            </label>
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              Đến
              <Input
                type="date"
                aria-label="Lọc đến ngày tạo"
                className="w-36"
                value={createdTo}
                min={createdFrom || undefined}
                onChange={(event) => onCreatedToChange(event.target.value)}
              />
            </label>
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
            <InboundRequestBulkActions
              hasActions={hasSelectionActions}
              selectedCount={selectedIdsForStatus.length}
              selectedStatusLabel={
                selectedStatus ? INBOUND_REQUEST_STATUS_LABELS[selectedStatus] : null
              }
              showDraftActions={showDraftActions}
              showApproveAction={showApproveAction}
              canDelete={canDelete}
              canSubmit={canSubmit}
              draftIds={selectedDraftIds}
              pendingIds={selectedPendingIds}
              isDeletingMany={isDeletingMany}
              isSubmitting={isSubmitting}
              isApproving={isApproving}
              onClearSelection={() => onSelectionChange([])}
              onDeleteMany={onDeleteMany}
              onSubmitMany={onSubmitMany}
              onApproveMany={onApproveMany}
            />
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
              canSubmit={canSubmit}
              canApprove={canApprove}
              isDeleting={isDeleting}
              isSubmitting={isSubmitting}
              isApproving={isApproving}
              isDeletingMany={isDeletingMany}
              selectedStatus={selectedStatus}
              selectAllStatus={headerSelectionStatus}
              selectAllIds={selectAllIds}
              isDuplicating={isDuplicating}
              selectedIds={selectedIds}
              allSelected={allSelected}
              onDelete={onDelete}
              onSubmit={onSubmit}
              onApprove={onApprove}
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
      <Table className="min-w-[1360px] table-fixed">
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
              'Ngày tạo',
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
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-2 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
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
                Tạo lúc {formatOperationalDateTime(item.createdAt)}
              </Link>
            </ItemDescription>
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
  canSubmit,
  canApprove,
  isDeleting,
  isSubmitting,
  isApproving,
  isDeletingMany,
  selectedStatus,
  selectAllStatus,
  selectAllIds,
  isDuplicating,
  selectedIds,
  allSelected,
  onDelete,
  onSubmit,
  onApprove,
  onDuplicate,
  onSelectionChange,
}: {
  readonly items: readonly InboundRequestSummary[]
  readonly canDelete: boolean
  readonly canCreate: boolean
  readonly canSubmit: boolean
  readonly canApprove: boolean
  readonly isDeleting: boolean
  readonly isSubmitting: boolean
  readonly isApproving: boolean
  readonly isDeletingMany: boolean
  readonly selectedStatus: InboundRequestStatus | null
  readonly selectAllStatus: InboundRequestStatus | null
  readonly selectAllIds: readonly string[]
  readonly isDuplicating: boolean
  readonly selectedIds: readonly string[]
  readonly allSelected: boolean
  readonly onDelete: (item: InboundRequestSummary) => void
  readonly onSubmit: (item: InboundRequestSummary) => void
  readonly onApprove: (item: InboundRequestSummary) => void
  readonly onDuplicate: (item: InboundRequestSummary) => void
  readonly onSelectionChange: (ids: readonly string[]) => void
}) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1360px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-10 w-12">
              <Checkbox
                aria-label={`Chọn tất cả ${selectAllStatus ? INBOUND_REQUEST_STATUS_LABELS[selectAllStatus] : 'yêu cầu nhập kho'} trên trang`}
                checked={allSelected}
                disabled={
                  selectAllIds.length === 0 || isDeletingMany || isSubmitting || isApproving
                }
                onCheckedChange={(checked) => onSelectionChange(checked ? selectAllIds : [])}
              />
            </TableHead>
            <TableHead className="sticky top-0 z-10 w-64">Mã yêu cầu</TableHead>
            <TableHead className="sticky top-0 z-10 w-44">Nguồn hàng</TableHead>
            <TableHead className="sticky top-0 z-10 w-40">Kho nhận</TableHead>
            <TableHead className="sticky top-0 z-10 w-32">Trạng thái</TableHead>
            <TableHead className="sticky top-0 z-10 w-36">Tiến độ nhận</TableHead>
            <TableHead className="sticky top-0 z-10 w-48">Ngày tạo</TableHead>
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
                {(item.status === INBOUND_REQUEST_STATUS.Draft && (canDelete || canSubmit)) ||
                (item.status === INBOUND_REQUEST_STATUS.PendingApproval && canApprove) ? (
                  <Checkbox
                    aria-label={`Chọn ${item.inboundRequestCode}`}
                    checked={selectedIds.includes(item.id)}
                    disabled={
                      isDeletingMany ||
                      isSubmitting ||
                      isApproving ||
                      (selectedStatus !== null && item.status !== selectedStatus)
                    }
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
                  className="hover:text-primary block whitespace-nowrap"
                >
                  {formatOperationalDateTime(item.createdAt)}
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
                  {canApprove && item.status === INBOUND_REQUEST_STATUS.PendingApproval ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Duyệt ${item.inboundRequestCode}`}
                          disabled={isApproving}
                          onClick={() => onApprove(item)}
                        >
                          <Check className="text-primary" aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duyệt yêu cầu</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {canSubmit && item.status === INBOUND_REQUEST_STATUS.Draft ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Gửi duyệt ${item.inboundRequestCode}`}
                          disabled={isSubmitting}
                          onClick={() => onSubmit(item)}
                        >
                          <Send className="text-primary" aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Gửi duyệt</TooltipContent>
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
