'use client'

import { Boxes, ListFilter, PackageSearch, RefreshCw, Search, TriangleAlert, X } from 'lucide-react'
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

interface InventoryDirectoryProps {
  readonly items: readonly InventoryBalance[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
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
  readonly canReserve: boolean
  readonly canReportDamaged: boolean
  readonly onSearchChange: (value: string) => void
  readonly onWarehouseChange: (value: string) => void
  readonly onProductChange: (value: string) => void
  readonly onResetFilters: () => void
  readonly onRetryFilters: () => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
  readonly onReserve: (item: InventoryBalance) => void
  readonly onReportDamaged: (item: InventoryBalance) => void
}

export function InventoryDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  warehouseId,
  productId,
  warehouseOptions,
  productOptions,
  isLoading,
  isFetching,
  isError,
  areFiltersLoading,
  areFiltersError,
  activeFilterCount,
  canReserve,
  canReportDamaged,
  onSearchChange,
  onWarehouseChange,
  onProductChange,
  onResetFilters,
  onRetryFilters,
  onPageChange,
  onRetry,
  onReserve,
  onReportDamaged,
}: InventoryDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <PackageSearch aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Tồn kho khả dụng</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi tồn thực tế, lượng đã giữ và lượng có thể sử dụng tại từng vị trí.
            </p>
          </div>
        </div>
        <div className="border-primary/20 bg-primary/5 flex min-h-10 items-center gap-2 border px-3">
          <Boxes className="text-primary size-4" aria-hidden="true" />
          <span className="text-xs font-medium tabular-nums">{totalCount} vị trí tồn kho</span>
        </div>
      </header>

      <InventoryWorkspaceNavigation currentView="availability" />

      <section className="bg-card flex min-h-0 flex-col border" aria-labelledby="inventory-title">
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="inventory-title" className="text-sm font-semibold">
              Danh sách tồn kho
            </h2>
            <p className="text-muted-foreground text-xs">Dữ liệu được hiển thị theo từng slot.</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="h-11 min-w-0 flex-1 sm:h-8 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm sản phẩm tồn kho"
                placeholder="Tìm SKU hoặc tên sản phẩm"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              {searchText ? (
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Xóa nội dung tìm kiếm"
                    onClick={() => onSearchChange('')}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
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
                  aria-label="Làm mới tồn kho"
                  onClick={onRetry}
                >
                  <RefreshCw
                    className={isFetching ? 'animate-spin motion-reduce:animate-none' : undefined}
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>Làm mới tồn kho</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {isFetching ? 'Đang cập nhật tồn kho' : 'Tồn kho đã cập nhật'}
        </p>

        {isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải tồn kho" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Không có tồn kho phù hợp"
            description={
              activeFilterCount || searchText
                ? 'Thử thay đổi từ khóa hoặc đặt lại bộ lọc.'
                : 'Chưa có số dư tồn kho để hiển thị.'
            }
          />
        ) : (
          <>
            <InventoryMobileList
              items={items}
              canReserve={canReserve}
              canReportDamaged={canReportDamaged}
              onReserve={onReserve}
              onReportDamaged={onReportDamaged}
            />
            <InventoryDesktopTable
              items={items}
              canReserve={canReserve}
              canReportDamaged={canReportDamaged}
              onReserve={onReserve}
              onReportDamaged={onReportDamaged}
            />
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
            <SheetTitle>Lọc tồn kho</SheetTitle>
            <SheetDescription>Thu hẹp dữ liệu theo kho hoặc sản phẩm.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
            {areFiltersError ? (
              <div
                className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 border p-3"
                role="alert"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
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
              <FieldLabel htmlFor="inventory-warehouse">Kho</FieldLabel>
              <NativeSelect
                id="inventory-warehouse"
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
              <FieldLabel htmlFor="inventory-product">Sản phẩm</FieldLabel>
              <NativeSelect
                id="inventory-product"
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
            <Button type="button" onClick={() => setIsFilterOpen(false)}>
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
    </div>
  )
}

function InventoryMobileList({
  items,
  canReserve,
  canReportDamaged,
  onReserve,
  onReportDamaged,
}: {
  readonly items: readonly InventoryBalance[]
  readonly canReserve: boolean
  readonly canReportDamaged: boolean
  readonly onReserve: (item: InventoryBalance) => void
  readonly onReportDamaged: (item: InventoryBalance) => void
}) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex items-center justify-between gap-3">
              <span className="truncate">{item.productName}</span>
              <span className="text-primary shrink-0 font-mono tabular-nums">
                {formatInventoryQuantity(item.availableQuantity)}
              </span>
            </ItemTitle>
            <ItemDescription>
              <span className="font-mono" translate="no">
                {item.sku}
              </span>{' '}
              · {item.warehouseName} / {item.slotCode}
            </ItemDescription>
            {canReserve && item.availableQuantity > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 w-fit"
                onClick={() => onReserve(item)}
              >
                Giữ tồn
              </Button>
            ) : null}
            {canReportDamaged && item.availableQuantity > 0 ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-1 w-fit"
                onClick={() => onReportDamaged(item)}
              >
                Báo hỏng
              </Button>
            ) : null}
            <ItemDescription>
              Thực tế {formatInventoryQuantity(item.quantityOnHand)} · Đã giữ{' '}
              {formatInventoryQuantity(item.reservedQuantity)}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

function InventoryDesktopTable({
  items,
  canReserve,
  canReportDamaged,
  onReserve,
  onReportDamaged,
}: {
  readonly items: readonly InventoryBalance[]
  readonly canReserve: boolean
  readonly canReportDamaged: boolean
  readonly onReserve: (item: InventoryBalance) => void
  readonly onReportDamaged: (item: InventoryBalance) => void
}) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[980px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-72">Sản phẩm</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-48">Kho / Slot</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Tồn thực tế</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Đã giữ</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Khả dụng</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-40">Cập nhật</TableHead>
            {canReserve || canReportDamaged ? (
              <TableHead className="bg-card sticky top-0 z-10 w-28 text-right">Thao tác</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="min-w-0">
                <p className="truncate font-medium">{item.productName}</p>
                <p className="text-muted-foreground truncate font-mono text-xs" translate="no">
                  {item.sku}
                </p>
              </TableCell>
              <TableCell className="min-w-0">
                <p className="truncate">{item.warehouseName}</p>
                <p className="text-muted-foreground truncate font-mono text-xs" translate="no">
                  {item.slotCode}
                </p>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatInventoryQuantity(item.quantityOnHand)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatInventoryQuantity(item.reservedQuantity)}
              </TableCell>
              <TableCell className="text-primary text-right font-mono font-semibold tabular-nums">
                {formatInventoryQuantity(item.availableQuantity)}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatInventoryDate(item.updatedAt)}
              </TableCell>
              {canReserve || canReportDamaged ? (
                <TableCell className="space-x-1 text-right">
                  {canReportDamaged ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={item.availableQuantity <= 0}
                      onClick={() => onReportDamaged(item)}
                    >
                      Báo hỏng
                    </Button>
                  ) : null}
                  {canReserve ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={item.availableQuantity <= 0}
                      onClick={() => onReserve(item)}
                    >
                      Giữ tồn
                    </Button>
                  ) : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
