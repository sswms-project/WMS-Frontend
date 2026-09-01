'use client'

import { Eye, MoreHorizontal, RefreshCw, Search, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import type { DeliveryStatus, DeliveryTracking } from '../types/delivery.types'
import {
  DELIVERY_STATUS_LABELS,
  formatDeliveryDate,
  getNextDeliveryStatuses,
} from '../utils/delivery-format'
import { DeliveryStatusBadge } from './DeliveriesPage/DeliveryStatusBadge'

export function DeliveryWorkspace({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  warehouseId,
  customerId,
  dateFrom,
  dateTo,
  warehouses,
  customers,
  staffNames,
  canUpdate,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onStatusChange,
  onWarehouseChange,
  onCustomerChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onInspect,
  onUpdate,
  onRetry,
}: {
  readonly items: readonly DeliveryTracking[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: DeliveryStatus | ''
  readonly warehouseId: string
  readonly customerId: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly warehouses: readonly { id: string; label: string }[]
  readonly customers: readonly { id: string; label: string }[]
  readonly staffNames: Readonly<Record<string, string>>
  readonly canUpdate: (item: DeliveryTracking) => boolean
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: DeliveryStatus | '') => void
  readonly onWarehouseChange: (value: string) => void
  readonly onCustomerChange: (value: string) => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onInspect: (item: DeliveryTracking) => void
  readonly onUpdate: (item: DeliveryTracking) => void
  readonly onRetry: () => void
}) {
  const actions = (item: DeliveryTracking): ReactNode => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Thao tác ${item.orderCode}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onInspect(item)}>
          <Eye />
          Chi tiết
        </DropdownMenuItem>
        {canUpdate(item) && getNextDeliveryStatuses(item.currentStatus).length > 0 ? (
          <DropdownMenuItem onSelect={() => onUpdate(item)}>
            <Truck />
            Cập nhật trạng thái
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return (
    <section className="flex min-h-0 flex-1 flex-col border">
      <header className="flex shrink-0 flex-col gap-3 border-b p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Theo dõi giao hàng</h1>
            <p className="text-muted-foreground text-xs">{totalCount} hành trình</p>
          </div>
          <Button variant="outline" size="icon" aria-label="Tải lại" onClick={onRetry}>
            <RefreshCw className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
            <Input
              className="pl-8"
              aria-label="Tìm giao hàng"
              value={searchText}
              placeholder="Mã đơn, người nhận..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <NativeSelect
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as DeliveryStatus | '')}
          >
            <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
            {Object.entries(DELIVERY_STATUS_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Lọc kho"
            value={warehouseId}
            onChange={(e) => onWarehouseChange(e.target.value)}
          >
            <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
            {warehouses.map((w) => (
              <NativeSelectOption key={w.id} value={w.id}>
                {w.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Lọc khách hàng"
            value={customerId}
            onChange={(e) => onCustomerChange(e.target.value)}
          >
            <NativeSelectOption value="">Tất cả khách hàng</NativeSelectOption>
            {customers.map((customer) => (
              <NativeSelectOption key={customer.id} value={customer.id}>
                {customer.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Input
            aria-label="Từ ngày"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
          <Input
            aria-label="Đến ngày"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </header>
      {isLoading ? (
        <OperationalLoadingState />
      ) : isError ? (
        <OperationalErrorState title="Không thể tải giao hàng" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Không có hành trình phù hợp"
          description="Thử thay đổi từ khóa hoặc bộ lọc."
        />
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-card sticky top-0 z-10">
                <tr className="border-b text-left">
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Kho</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Người nhận</th>
                  <th className="p-3">Phụ trách</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Ngày tạo</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.outboundOrderId} className="border-b">
                    <td className="p-3 font-mono font-medium">{item.orderCode}</td>
                    <td className="p-3">{item.warehouseName}</td>
                    <td className="p-3">{item.customerName}</td>
                    <td className="p-3">{item.recipientName}</td>
                    <td className="p-3">
                      {item.assignedDeliveryStaffName ??
                        (item.assignedDeliveryStaffId
                          ? (staffNames[item.assignedDeliveryStaffId] ?? 'Đã phân công')
                          : 'Chưa phân công')}
                    </td>
                    <td className="p-3">
                      <DeliveryStatusBadge status={item.currentStatus} />
                    </td>
                    <td className="p-3">{formatDeliveryDate(item.createdAt)}</td>
                    <td className="p-3 text-right">{actions(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
