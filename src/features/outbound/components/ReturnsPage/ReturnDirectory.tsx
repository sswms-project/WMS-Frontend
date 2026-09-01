'use client'

import { Check, Eye, MoreHorizontal, Search, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import type { ReturnStatus, ReturnSummary } from '../../types/outbound.types'
import { RETURN_STATUS_LABELS, formatOutboundDate } from '../../utils/outbound-format'
import { ReturnStatusBadge } from './ReturnStatusBadge'

interface ReturnDirectoryProps {
  readonly items: readonly ReturnSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: ReturnStatus | ''
  readonly warehouseId: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly warehouses: readonly { id: string; label: string }[]
  readonly permissions: readonly string[]
  readonly currentUserId: string | null
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: ReturnStatus | '') => void
  readonly onWarehouseChange: (value: string) => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onInspect: (item: ReturnSummary) => void
  readonly onApprove: (item: ReturnSummary) => void
  readonly onReject: (item: ReturnSummary) => void
  readonly onRetry: () => void
}

export function ReturnDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  warehouseId,
  dateFrom,
  dateTo,
  warehouses,
  permissions,
  currentUserId,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onStatusChange,
  onWarehouseChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onInspect,
  onApprove,
  onReject,
  onRetry,
}: ReturnDirectoryProps) {
  const canApprove = permissions.includes('returns:approve')
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 items-start gap-3 border-b pb-4">
        <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
          <Undo2 aria-hidden="true" />
        </span>
        <div>
          <p className="text-primary text-xs font-medium">Xuất kho</p>
          <h1 className="text-xl font-semibold">Hoàn hàng</h1>
          <p className="text-muted-foreground text-sm">
            Duyệt và theo dõi hàng hoàn theo đơn xuất.
          </p>
        </div>
      </header>
      <section className="bg-card flex min-h-0 flex-col overflow-hidden border [&>[data-slot=table-container]]:overflow-y-auto">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-3">
          <div>
            <h2 className="text-sm font-semibold">Danh sách phiếu hoàn</h2>
            <p className="text-muted-foreground text-xs">{totalCount} phiếu</p>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-5">
            <InputGroup className="min-w-0 lg:w-64">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm phiếu hoàn"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </InputGroup>
            <NativeSelect
              aria-label="Lọc trạng thái hoàn hàng"
              value={status}
              onChange={(event) => onStatusChange(event.target.value as ReturnStatus | '')}
            >
              <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
              {Object.entries(RETURN_STATUS_LABELS).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="Lọc kho hoàn"
              value={warehouseId}
              onChange={(event) => onWarehouseChange(event.target.value)}
            >
              <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
              {warehouses.map((warehouse) => (
                <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                  {warehouse.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Input
              aria-label="Từ ngày"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
            <Input
              aria-label="Đến ngày"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải phiếu hoàn" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có phiếu hoàn phù hợp"
            description="Thử đổi từ khóa hoặc trạng thái."
          />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky top-0">Mã phiếu</TableHead>
                <TableHead className="bg-card sticky top-0">Đơn xuất</TableHead>
                <TableHead className="bg-card sticky top-0">Lý do</TableHead>
                <TableHead className="bg-card sticky top-0">Trạng thái</TableHead>
                <TableHead className="bg-card sticky top-0">Ngày tạo</TableHead>
                <TableHead className="bg-card sticky top-0">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.returnCode}</TableCell>
                  <TableCell className="font-mono">{item.orderCode}</TableCell>
                  <TableCell className="max-w-64 truncate">{item.reason}</TableCell>
                  <TableCell>
                    <ReturnStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>{formatOutboundDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Thao tác với ${item.returnCode}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => onInspect(item)}>
                            <Eye />
                            Chi tiết
                          </DropdownMenuItem>
                          {canApprove &&
                          item.status === 'Requested' &&
                          item.createdBy !== currentUserId ? (
                            <>
                              <DropdownMenuItem onSelect={() => onApprove(item)}>
                                <Check />
                                Duyệt
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => onReject(item)}
                              >
                                <X />
                                Từ chối
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <OperationalPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          isPending={isFetching}
          onPageChange={onPageChange}
        />
      </section>
    </div>
  )
}
