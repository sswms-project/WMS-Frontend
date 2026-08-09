import { ArrowUpRight, Warehouse } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WarehouseResponse } from '@/types/warehouse'

interface WarehouseListProps {
  readonly warehouses: readonly WarehouseResponse[]
  readonly onView: (warehouseId: string) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))
}

function WarehouseStatusBadge({ status }: { readonly status: string }) {
  const isActive = status === 'Active'
  return (
    <Badge variant={isActive ? 'outline' : 'destructive'}>{isActive ? 'Hoạt động' : status}</Badge>
  )
}

export function WarehouseList({ warehouses, onView }: WarehouseListProps) {
  return (
    <>
      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Mã kho</TableHead>
              <TableHead>Tên kho</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Thao tác</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="pl-4 font-mono text-xs font-medium">
                  {warehouse.warehouseCode}
                </TableCell>
                <TableCell className="max-w-52 truncate font-medium">
                  {warehouse.warehouseName}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-72 truncate">
                  {warehouse.address || 'Chưa cập nhật'}
                </TableCell>
                <TableCell>
                  <WarehouseStatusBadge status={warehouse.status} />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(warehouse.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Xem chi tiết ${warehouse.warehouseName}`}
                    onClick={() => onView(warehouse.id)}
                  >
                    <ArrowUpRight aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y md:hidden">
        {warehouses.map((warehouse) => (
          <article key={warehouse.id} className="flex min-w-0 items-start gap-3 px-3 py-3">
            <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center">
              <Warehouse aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{warehouse.warehouseName}</p>
                  <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                    {warehouse.warehouseCode}
                  </p>
                </div>
                <WarehouseStatusBadge status={warehouse.status} />
              </div>
              <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                {warehouse.address || 'Chưa cập nhật địa chỉ'}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  {formatDate(warehouse.createdAt)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(warehouse.id)}
                >
                  Xem chi tiết
                  <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
