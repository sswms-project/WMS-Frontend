'use client'

import {
  CircleOff,
  Eye,
  ListFilter,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { useState } from 'react'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
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
import { APP_ROUTES } from '@/routes/app-routes'
import type { Supplier, SupplierStatus } from '../../types/supplier.types'
import { SUPPLIER_STATUS_OPTIONS, formatSupplierText } from '../../utils/supplier-format'
import { SupplierStatusBadge } from './SupplierStatusBadge'

interface SupplierDirectoryProps {
  readonly items: readonly Supplier[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly status: SupplierStatus | ''
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly canCreate: boolean
  readonly canUpdate: boolean
  readonly canDeactivate: boolean
  readonly canReactivate: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: SupplierStatus | '') => void
  readonly onPageChange: (page: number) => void
  readonly onCreate: () => void
  readonly onEdit: (supplier: Supplier) => void
  readonly onDeactivate: (supplier: Supplier) => void
  readonly onReactivate: (supplier: Supplier) => void
  readonly onRetry: () => void
}

export function SupplierDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  status,
  isLoading,
  isFetching,
  isError,
  canCreate,
  canUpdate,
  canDeactivate,
  canReactivate,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onCreate,
  onEdit,
  onDeactivate,
  onReactivate,
  onRetry,
}: SupplierDirectoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <Truck aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Mua hàng</p>
            <h1 className="mt-0.5 text-xl font-semibold">Nhà cung cấp</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Quản lý danh bạ nhà cung cấp phục vụ hoạt động mua hàng của tổ chức.
            </p>
          </div>
        </div>
        {canCreate ? (
          <Button type="button" className="w-full sm:w-auto" onClick={onCreate}>
            <Plus aria-hidden="true" />
            Thêm nhà cung cấp
          </Button>
        ) : null}
      </header>

      <section
        className="bg-card flex min-h-0 flex-col border"
        aria-labelledby="supplier-directory-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="supplier-directory-title" className="text-sm font-semibold">
              Danh sách nhà cung cấp
            </h2>
            <p className="text-muted-foreground text-xs tabular-nums">{totalCount} nhà cung cấp</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <InputGroup className="min-w-0 flex-1 sm:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm nhà cung cấp"
                placeholder="Tìm theo tên, số điện thoại, email hoặc địa chỉ"
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
          <OperationalErrorState title="Không thể tải danh sách nhà cung cấp" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có nhà cung cấp phù hợp"
            description="Thử đổi từ khóa tìm kiếm, bộ lọc trạng thái hoặc thêm nhà cung cấp mới."
          />
        ) : (
          <>
            <SupplierMobileList items={items} />
            <SupplierDesktopTable
              items={items}
              canUpdate={canUpdate}
              canDeactivate={canDeactivate}
              canReactivate={canReactivate}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
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
            <SheetTitle>Bộ lọc nhà cung cấp</SheetTitle>
            <SheetDescription>Thu hẹp danh sách theo trạng thái hợp tác.</SheetDescription>
          </SheetHeader>
          <FieldGroup className="flex-1 p-4">
            <Field>
              <FieldLabel htmlFor="supplier-filter-status">Trạng thái</FieldLabel>
              <NativeSelect
                id="supplier-filter-status"
                className="w-full"
                value={status}
                onChange={(event) => onStatusChange(event.target.value as SupplierStatus | '')}
              >
                <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
                {SUPPLIER_STATUS_OPTIONS.map((option) => (
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
            <Button type="button" variant="outline" onClick={() => onStatusChange('')}>
              Đặt lại
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function SupplierMobileList({ items }: { readonly items: readonly Supplier[] }) {
  return (
    <ItemGroup className="gap-0 md:hidden">
      {items.map((item) => (
        <Item key={item.id} className="border-b last:border-b-0">
          <ItemContent className="min-w-0">
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <Link
                href={APP_ROUTES.supplierDetail(item.id) as Route}
                className="max-w-full min-w-0 truncate font-semibold hover:underline"
              >
                {item.supplierName}
              </Link>
              <SupplierStatusBadge status={item.status} />
            </ItemTitle>
            <ItemDescription>
              {item.phone} · {formatSupplierText(item.email)}
            </ItemDescription>
            <ItemDescription>{formatSupplierText(item.address)}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

interface SupplierDesktopTableProps {
  readonly items: readonly Supplier[]
  readonly canUpdate: boolean
  readonly canDeactivate: boolean
  readonly canReactivate: boolean
  readonly onEdit: (supplier: Supplier) => void
  readonly onDeactivate: (supplier: Supplier) => void
  readonly onReactivate: (supplier: Supplier) => void
}

function SupplierDesktopTable({
  items,
  canUpdate,
  canDeactivate,
  canReactivate,
  onEdit,
  onDeactivate,
  onReactivate,
}: SupplierDesktopTableProps) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1040px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-72">Nhà cung cấp</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-40">Số điện thoại</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-56">Email</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-72">Địa chỉ</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36">Trạng thái</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32">
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
                    <Link
                      href={APP_ROUTES.supplierDetail(item.id) as Route}
                      className="block truncate font-semibold hover:underline"
                    >
                      {item.supplierName}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{item.supplierName}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="truncate tabular-nums">{item.phone}</TableCell>
              <TableCell className="truncate">{formatSupplierText(item.email)}</TableCell>
              <TableCell className="truncate">{formatSupplierText(item.address)}</TableCell>
              <TableCell>
                <SupplierStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={APP_ROUTES.supplierDetail(item.id) as Route}
                          aria-label={`Xem chi tiết ${item.supplierName}`}
                        >
                          <Eye aria-hidden="true" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Xem chi tiết</TooltipContent>
                  </Tooltip>
                  {canUpdate ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Cập nhật ${item.supplierName}`}
                          onClick={() => onEdit(item)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cập nhật</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {canDeactivate && item.status === 'Active' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Ngừng hợp tác với ${item.supplierName}`}
                          onClick={() => onDeactivate(item)}
                        >
                          <CircleOff aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ngừng hợp tác</TooltipContent>
                    </Tooltip>
                  ) : null}
                  {canReactivate && item.status === 'Inactive' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Khôi phục hợp tác với ${item.supplierName}`}
                          onClick={() => onReactivate(item)}
                        >
                          <RotateCcw aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Khôi phục hợp tác</TooltipContent>
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
