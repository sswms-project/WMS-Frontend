'use client'

import { Boxes, ListFilter, LockKeyhole, RefreshCw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import type { InventoryBalance, InventoryFilterOption } from '../../types/inventory.types'
import { formatInventoryDate, formatInventoryQuantity } from '../../utils/inventory-format'
import { InventoryWorkspaceNavigation } from '../InventoryWorkspaceNavigation'

interface InventoryReservationDirectoryProps {
  readonly permissions: readonly string[]
  readonly items: readonly InventoryBalance[]
  readonly warehouseId: string
  readonly productId: string
  readonly warehouseOptions: readonly InventoryFilterOption[]
  readonly productOptions: readonly InventoryFilterOption[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly areFiltersLoading: boolean
  readonly areFiltersError: boolean
  readonly activeFilterCount: number
  readonly canRelease: boolean
  readonly onWarehouseChange: (value: string) => void
  readonly onProductChange: (value: string) => void
  readonly onResetFilters: () => void
  readonly onRetryFilters: () => void
  readonly onRetry: () => void
  readonly onRelease: (item: InventoryBalance) => void
}

export function InventoryReservationDirectory(props: InventoryReservationDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const {
    items,
    isLoading,
    isFetching,
    isError,
    activeFilterCount,
    canRelease,
    onRetry,
    onRelease,
  } = props
  const totalReserved = items.reduce((total, item) => total + item.reservedQuantity, 0)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <LockKeyhole aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Tồn kho đang giữ</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi lượng tồn đã được dành cho các nghiệp vụ đang xử lý.
            </p>
          </div>
        </div>
        <div className="border-primary/20 bg-primary/5 flex min-h-10 items-center gap-2 border px-3">
          <Boxes className="text-primary size-4" aria-hidden="true" />
          <span className="text-xs font-medium tabular-nums">
            {formatInventoryQuantity(totalReserved)} đơn vị đang giữ
          </span>
        </div>
      </header>
      <InventoryWorkspaceNavigation currentView="reservations" permissions={props.permissions} />
      <section className="bg-card flex min-h-0 flex-col border" aria-labelledby="reservation-title">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b p-3">
          <div>
            <h2 id="reservation-title" className="text-sm font-semibold">
              Danh sách tồn đang giữ
            </h2>
            <p className="text-muted-foreground text-xs">
              Dữ liệu tổng hợp theo sản phẩm, kho và slot.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:h-8"
              onClick={() => setIsFilterOpen(true)}
            >
              <ListFilter aria-hidden="true" />
              Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 sm:size-8"
                  disabled={isFetching}
                  aria-label="Làm mới tồn đang giữ"
                  onClick={onRetry}
                >
                  <RefreshCw
                    className={isFetching ? 'animate-spin motion-reduce:animate-none' : undefined}
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>Làm mới dữ liệu</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {isFetching ? 'Đang cập nhật tồn đang giữ' : 'Tồn đang giữ đã cập nhật'}
        </p>
        {isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải tồn đang giữ" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Không có tồn đang giữ phù hợp"
            description={
              activeFilterCount
                ? 'Thử thay đổi hoặc đặt lại bộ lọc.'
                : 'Hiện chưa có số lượng tồn kho nào đang được giữ.'
            }
          />
        ) : (
          <ReservationResults items={items} canRelease={canRelease} onRelease={onRelease} />
        )}
      </section>
      <ReservationFilters {...props} open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </div>
  )
}

function ReservationResults({
  items,
  canRelease,
  onRelease,
}: {
  readonly items: readonly InventoryBalance[]
  readonly canRelease: boolean
  readonly onRelease: (item: InventoryBalance) => void
}) {
  return (
    <>
      <ItemGroup className="gap-0 md:hidden">
        {items.map((item) => (
          <Item key={item.id} className="border-b last:border-b-0">
            <ItemContent className="min-w-0">
              <ItemTitle className="flex justify-between gap-3">
                <span className="truncate">{item.productName || 'Sản phẩm chưa xác định'}</span>
                <span className="text-primary shrink-0 font-mono font-semibold tabular-nums">
                  {formatInventoryQuantity(item.reservedQuantity)}
                </span>
              </ItemTitle>
              <ItemDescription>
                <span className="font-mono">{item.sku || item.productId}</span> ·{' '}
                {item.warehouseName || item.warehouseId} / {item.slotCode || item.slotId}
              </ItemDescription>
              {canRelease ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit"
                  onClick={() => onRelease(item)}
                >
                  Giải phóng
                </Button>
              ) : null}
              <ItemDescription>
                Khả dụng {formatInventoryQuantity(item.availableQuantity)} · Cập nhật{' '}
                {formatInventoryDate(item.updatedAt)}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      <div className="hidden min-h-0 flex-1 overflow-auto md:block">
        <Table className="min-w-[900px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card sticky top-0 z-10 w-72">Sản phẩm</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-56">Kho / Slot</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Đang giữ</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Khả dụng</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-40">Cập nhật</TableHead>
              {canRelease ? (
                <TableHead className="bg-card sticky top-0 z-10 w-28 text-right">
                  Thao tác
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="truncate font-medium">
                    {item.productName || 'Sản phẩm chưa xác định'}
                  </p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    {item.sku || item.productId}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="truncate">{item.warehouseName || item.warehouseId}</p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    {item.slotCode || item.slotId}
                  </p>
                </TableCell>
                <TableCell className="text-primary text-right font-mono font-semibold tabular-nums">
                  {formatInventoryQuantity(item.reservedQuantity)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatInventoryQuantity(item.availableQuantity)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatInventoryDate(item.updatedAt)}
                </TableCell>
                {canRelease ? (
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRelease(item)}
                    >
                      Giải phóng
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function ReservationFilters({
  open,
  warehouseId,
  productId,
  warehouseOptions,
  productOptions,
  areFiltersLoading,
  areFiltersError,
  activeFilterCount,
  onOpenChange,
  onWarehouseChange,
  onProductChange,
  onResetFilters,
  onRetryFilters,
}: InventoryReservationDirectoryProps & {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Lọc tồn đang giữ</SheetTitle>
          <SheetDescription>Thu hẹp dữ liệu theo kho hoặc sản phẩm.</SheetDescription>
        </SheetHeader>
        <FieldGroup className="flex-1 p-4">
          {areFiltersError ? (
            <div
              className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 border p-3"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 size-4" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium">Không thể tải đầy đủ bộ lọc</p>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={onRetryFilters}
                >
                  Thử tải lại
                </Button>
              </div>
            </div>
          ) : null}
          <Field>
            <FieldLabel htmlFor="reservation-warehouse">Kho</FieldLabel>
            <NativeSelect
              id="reservation-warehouse"
              className="h-11 sm:h-8"
              value={warehouseId}
              disabled={areFiltersLoading}
              onChange={(event) => onWarehouseChange(event.target.value)}
            >
              <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
              {warehouseOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="reservation-product">Sản phẩm</FieldLabel>
            <NativeSelect
              id="reservation-product"
              className="h-11 sm:h-8"
              value={productId}
              disabled={areFiltersLoading}
              onChange={(event) => onProductChange(event.target.value)}
            >
              <NativeSelectOption value="">Tất cả sản phẩm</NativeSelectOption>
              {productOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Xem kết quả
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={activeFilterCount === 0}
            onClick={onResetFilters}
          >
            Đặt lại
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
