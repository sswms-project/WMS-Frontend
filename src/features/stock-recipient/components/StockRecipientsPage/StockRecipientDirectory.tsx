'use client'

import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import type { StockRecipient } from '../../types/stock-recipient.types'

interface StockRecipientDirectoryProps {
  readonly items: readonly StockRecipient[]
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

export function StockRecipientDirectory({
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
}: StockRecipientDirectoryProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <Users aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Danh mục</p>
            <h1 className="text-xl font-semibold">Đơn vị nhận hàng</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý người nhận hàng và lịch sử yêu cầu xuất kho.
            </p>
          </div>
        </div>
        {canCreate ? (
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" />
            Thêm đơn vị nhận hàng
          </Button>
        ) : null}
      </header>
      <section className="bg-card flex min-h-0 flex-col overflow-hidden border [&>[data-slot=table-container]]:overflow-y-auto">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b p-3">
          <div>
            <h2 className="text-sm font-semibold">Danh sách đơn vị nhận hàng</h2>
            <p className="text-muted-foreground text-xs">{totalCount} đơn vị nhận hàng</p>
          </div>
          <InputGroup className="w-72">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm đơn vị nhận hàng"
              value={searchText}
              placeholder="Mã, tên hoặc số điện thoại…"
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
        </div>
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải đơn vị nhận hàng" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có đơn vị nhận hàng phù hợp"
            description="Thử đổi từ khóa hoặc thêm đơn vị nhận hàng mới."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky top-0">Mã</TableHead>
                <TableHead className="bg-card sticky top-0">Tên đơn vị nhận hàng</TableHead>
                <TableHead className="bg-card sticky top-0">Điện thoại</TableHead>
                <TableHead className="bg-card sticky top-0">Email</TableHead>
                <TableHead className="bg-card sticky top-0">Trạng thái</TableHead>
                <TableHead className="bg-card sticky top-0">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((stockRecipient) => (
                <TableRow key={stockRecipient.id}>
                  <TableCell className="font-mono">{stockRecipient.recipientCode}</TableCell>
                  <TableCell>{stockRecipient.recipientName}</TableCell>
                  <TableCell>{stockRecipient.phone}</TableCell>
                  <TableCell>{stockRecipient.email ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={stockRecipient.status === 'Active' ? 'default' : 'outline'}>
                      {stockRecipient.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={APP_ROUTES.stockRecipientDetail(stockRecipient.id)}>
                        Chi tiết
                      </Link>
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
