'use client'

import { ArrowRight, MapPinned, RefreshCw, TriangleAlert } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_ROUTES } from '@/routes/app-routes'
import { useWarehousesQuery } from '../hooks/use-warehouse'

export default function WarehouseLayoutDirectoryPage() {
  const warehousesQuery = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true })
  const warehouses = warehousesQuery.data?.items ?? []

  return (
    <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col gap-5">
      <header className="shrink-0 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <MapPinned aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Vận hành kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Sơ đồ kho</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Chọn kho được phân công để xem khu vực, kệ và vị trí lưu trữ.
            </p>
          </div>
        </div>
      </header>

      <section className="bg-card min-h-0 border" aria-labelledby="warehouse-layout-list-title">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 id="warehouse-layout-list-title" className="text-sm font-semibold">
              Kho được phép xem
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {warehousesQuery.data?.totalCount ?? 0} kho
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Tải lại"
            onClick={() => void warehousesQuery.refetch()}
          >
            <RefreshCw
              className={warehousesQuery.isFetching ? 'animate-spin' : undefined}
              aria-hidden="true"
            />
          </Button>
        </div>
        {warehousesQuery.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : warehousesQuery.isError ? (
          <Empty className="min-h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlert className="text-destructive" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Không thể tải danh sách kho</EmptyTitle>
              <EmptyDescription>Kiểm tra quyền truy cập rồi thử lại.</EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={() => void warehousesQuery.refetch()}>
              Thử lại
            </Button>
          </Empty>
        ) : warehouses.length === 0 ? (
          <Empty className="min-h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPinned aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Chưa có kho được phân công</EmptyTitle>
              <EmptyDescription>
                Liên hệ Quản lý kho để được phân công kho làm việc.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="flex items-center gap-3 px-4 py-3">
                <MapPinned className="text-primary size-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{warehouse.warehouseName}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {warehouse.warehouseCode}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={APP_ROUTES.warehouseLayout(warehouse.id) as Route}>
                    Mở sơ đồ
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
