'use client'

import { ClipboardList, Eye, ListFilter, Plus, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { useState } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Progress } from '@/components/ui/progress'
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
import type { PurchaseOrderStatus, PurchaseOrderSummary } from '../../types/purchase-order.types'
import {
  formatOperationalDate,
  formatQuantity,
  PURCHASE_ORDER_STATUS_LABELS,
} from '../../utils/purchase-order-format'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'

interface PurchaseOrderDirectoryProps {
  readonly items: readonly PurchaseOrderSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: PurchaseOrderStatus | ''
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: PurchaseOrderStatus | '') => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}

export function PurchaseOrderDirectory({
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
}: PurchaseOrderDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <ClipboardList aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Mua hàng</p>
            <h1 className="mt-0.5 text-xl font-semibold">Đơn mua hàng</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi đơn mua từ bản nháp đến khi nhận đủ hàng.
            </p>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={APP_ROUTES.purchaseOrderCreate as Route}>
            <Plus aria-hidden="true" />
            Tạo đơn mua
          </Link>
        </Button>
      </header>

      <section
        className="bg-card flex min-h-0 flex-col border"
        aria-labelledby="po-directory-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="po-directory-title" className="text-sm font-semibold">
              Danh sách đơn mua
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">{totalCount} đơn</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm đơn mua"
                placeholder="Tìm mã PO, nhà cung cấp…"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </InputGroup>
            <Button type="button" variant="outline" onClick={() => setIsFilterOpen(true)}>
              <ListFilter aria-hidden="true" />
              Bộ lọc{status ? ' (1)' : ''}
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
          <OperationalErrorState title="Không thể tải đơn mua" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có đơn mua phù hợp"
            description="Thử đổi từ khóa, bộ lọc hoặc tạo đơn mua đầu tiên."
          />
        ) : (
          <>
            <PurchaseOrderMobileList items={items} />
            <PurchaseOrderDesktopTable items={items} />
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
            <SheetTitle>Bộ lọc đơn mua</SheetTitle>
            <SheetDescription>Thu hẹp danh sách theo trạng thái xử lý.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
            <Field>
              <FieldLabel htmlFor="purchase-order-status">Trạng thái</FieldLabel>
              <NativeSelect
                id="purchase-order-status"
                className="w-full"
                value={status}
                onChange={(event) => onStatusChange(event.target.value as PurchaseOrderStatus | '')}
              >
                <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
                {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([value, label]) => (
                  <NativeSelectOption key={value} value={value}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </FieldGroup>
          <SheetFooter>
            <Button type="button" onClick={() => setIsFilterOpen(false)}>
              Xem kết quả
            </Button>
            <Button type="button" variant="outline" onClick={() => onStatusChange('')}>
              Đặt lại
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function receivedPercent(item: PurchaseOrderSummary) {
  return item.orderedQuantity <= 0
    ? 0
    : Math.min(100, (item.receivedQuantity / item.orderedQuantity) * 100)
}

function PurchaseOrderMobileList({ items }: { readonly items: readonly PurchaseOrderSummary[] }) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <Link
                href={APP_ROUTES.purchaseOrderDetail(item.id) as Route}
                className="max-w-full min-w-0 truncate font-mono font-semibold hover:underline"
                translate="no"
              >
                {item.poNumber}
              </Link>
              <PurchaseOrderStatusBadge status={item.status} />
            </ItemTitle>
            <ItemDescription>
              {item.supplierName} · {item.warehouseName ?? 'Chưa xác định kho'}
            </ItemDescription>
            <ItemDescription>
              {formatQuantity(item.receivedQuantity)} / {formatQuantity(item.orderedQuantity)} đã
              nhận · {formatOperationalDate(item.expectedDate)}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

function PurchaseOrderDesktopTable({ items }: { readonly items: readonly PurchaseOrderSummary[] }) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1120px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-64">Mã PO</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-44">Nhà cung cấp</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-40">Kho nhận</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32">Trạng thái</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36">Tiến độ nhận</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32">Ngày dự kiến</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-12">
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="min-w-0">
                <div className="min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={APP_ROUTES.purchaseOrderDetail(item.id) as Route}
                        className="block truncate font-mono font-semibold hover:underline"
                        translate="no"
                      >
                        {item.poNumber}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono" translate="no">
                      {item.poNumber}
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-muted-foreground truncate text-xs">{item.createdByName}</p>
                </div>
              </TableCell>
              <TableCell className="truncate">{item.supplierName}</TableCell>
              <TableCell className="truncate">{item.warehouseName ?? 'Chưa xác định'}</TableCell>
              <TableCell>
                <PurchaseOrderStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xs tabular-nums">
                    {formatQuantity(item.receivedQuantity)} / {formatQuantity(item.orderedQuantity)}
                  </span>
                  <Progress value={receivedPercent(item)} />
                </div>
              </TableCell>
              <TableCell>{formatOperationalDate(item.expectedDate)}</TableCell>
              <TableCell className="text-right">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        href={APP_ROUTES.purchaseOrderDetail(item.id) as Route}
                        aria-label={`Xem ${item.poNumber}`}
                      >
                        <Eye aria-hidden="true" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xem chi tiết</TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
