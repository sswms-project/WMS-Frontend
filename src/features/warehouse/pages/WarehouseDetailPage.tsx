'use client'

import { useState } from 'react'
import { ArrowLeft, Edit3, LayoutPanelTop, RefreshCw, TriangleAlert, Warehouse } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APP_ROUTES } from '@/routes/app-routes'
import type { ApiErrorResponse } from '@/types/api'
import {
  WarehouseEditDialog,
  WarehouseLayoutView,
  WarehouseOverview,
} from '../components/WarehouseDetailPage'
import {
  useUpdateWarehouseMutation,
  useWarehouseLayoutQuery,
  useWarehouseQuery,
} from '../hooks/use-warehouse'
import type { UpdateWarehouseFormValues } from '../schemas/warehouse.schema'

type WarehouseDetailTab = 'overview' | 'layout'

interface WarehouseDetailPageProps {
  readonly warehouseId: string
}

function isWarehouseDetailTab(value: string): value is WarehouseDetailTab {
  return value === 'overview' || value === 'layout'
}

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

export function WarehouseDetailPage({ warehouseId }: WarehouseDetailPageProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<WarehouseDetailTab>('overview')
  const warehouseQuery = useWarehouseQuery(warehouseId)
  const layoutQuery = useWarehouseLayoutQuery(warehouseId, activeTab === 'layout')
  const updateMutation = useUpdateWarehouseMutation()

  async function handleUpdate(values: UpdateWarehouseFormValues): Promise<boolean> {
    try {
      await updateMutation.mutateAsync({ warehouseId, request: values })
      toast.success('Đã cập nhật thông tin kho.')
      setIsEditDialogOpen(false)
      return true
    } catch (error) {
      console.error(error)
      toast.error(
        isApiErrorResponse(error) && error.message
          ? error.message
          : 'Không thể cập nhật thông tin kho. Vui lòng thử lại.'
      )
      return false
    }
  }

  if (warehouseQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1180px] space-y-5">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (warehouseQuery.isError || !warehouseQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[1180px]">
        <Empty className="min-h-80 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert className="text-destructive" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Không thể tải thông tin kho</EmptyTitle>
            <EmptyDescription>
              Kho có thể không tồn tại hoặc bạn không còn quyền truy cập.
            </EmptyDescription>
          </EmptyHeader>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={APP_ROUTES.warehouses}>
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Quay lại danh sách
              </Link>
            </Button>
            <Button type="button" onClick={() => void warehouseQuery.refetch()}>
              <RefreshCw data-icon="inline-start" aria-hidden="true" />
              Thử lại
            </Button>
          </div>
        </Empty>
      </div>
    )
  }

  const warehouse = warehouseQuery.data

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-5">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon-sm">
            <Link href={APP_ROUTES.warehouses} aria-label="Quay lại danh sách kho">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Kho hàng</p>
            <h1 className="mt-0.5 truncate text-xl font-semibold">{warehouse.warehouseName}</h1>
            <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
              {warehouse.warehouseCode}
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit3 data-icon="inline-start" aria-hidden="true" />
          Chỉnh sửa
        </Button>
      </header>

      <Tabs
        value={activeTab}
        className="gap-4"
        onValueChange={(value) => isWarehouseDetailTab(value) && setActiveTab(value)}
      >
        <TabsList variant="line" className="h-10 w-full justify-start border-b p-0 sm:w-fit">
          <TabsTrigger value="overview" className="h-10 px-3">
            <Warehouse data-icon="inline-start" aria-hidden="true" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="layout" className="h-10 px-3">
            <LayoutPanelTop data-icon="inline-start" aria-hidden="true" />
            Bố cục kho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WarehouseOverview warehouse={warehouse} />
        </TabsContent>

        <TabsContent value="layout">
          {layoutQuery.isLoading && <Skeleton className="h-64" />}
          {layoutQuery.isError && (
            <Empty className="min-h-52 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TriangleAlert className="text-destructive" aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Không thể tải bố cục kho</EmptyTitle>
                <EmptyDescription>Vui lòng kiểm tra kết nối rồi thử lại.</EmptyDescription>
              </EmptyHeader>
              <Button type="button" variant="outline" onClick={() => void layoutQuery.refetch()}>
                <RefreshCw data-icon="inline-start" aria-hidden="true" />
                Thử lại
              </Button>
            </Empty>
          )}
          {!layoutQuery.isLoading && !layoutQuery.isError && (
            <WarehouseLayoutView zones={layoutQuery.data ?? []} />
          )}
        </TabsContent>
      </Tabs>

      <WarehouseEditDialog
        warehouse={warehouse}
        open={isEditDialogOpen}
        isPending={updateMutation.isPending}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdate}
      />
    </div>
  )
}
