'use client'

import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
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
import { APP_ROUTES } from '@/routes/app-routes'
import type { Customer } from '../../types/customer.types'

interface CustomerDirectoryProps {
  readonly items: readonly Customer[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly canCreate: boolean
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onCreate: () => void
  readonly onRetry: () => void
}

export function CustomerDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  canCreate,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onPageChange,
  onCreate,
  onRetry,
}: CustomerDirectoryProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <Users aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Danh mục</p>
            <h1 className="text-xl font-semibold">Khách hàng</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý người nhận hàng và lịch sử đơn xuất.
            </p>
          </div>
        </div>
        {canCreate ? (
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" />
            Thêm khách hàng
          </Button>
        ) : null}
      </header>
      <section className="bg-card flex min-h-0 flex-col overflow-hidden border [&>[data-slot=table-container]]:overflow-y-auto">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b p-3">
          <div>
            <h2 className="text-sm font-semibold">Danh sách khách hàng</h2>
            <p className="text-muted-foreground text-xs">{totalCount} khách hàng</p>
          </div>
          <InputGroup className="w-72">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm khách hàng"
              value={searchText}
              placeholder="Mã, tên hoặc số điện thoại…"
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
        </div>
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải khách hàng" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có khách hàng phù hợp"
            description="Thử đổi từ khóa hoặc thêm khách hàng mới."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky top-0">Mã</TableHead>
                <TableHead className="bg-card sticky top-0">Tên khách hàng</TableHead>
                <TableHead className="bg-card sticky top-0">Điện thoại</TableHead>
                <TableHead className="bg-card sticky top-0">Email</TableHead>
                <TableHead className="bg-card sticky top-0">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono">{customer.customerCode}</TableCell>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={APP_ROUTES.customerDetail(customer.id)}>Chi tiết</Link>
                    </Button>
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
