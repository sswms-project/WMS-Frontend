'use client'

import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CircleOff,
  Edit3,
  Ellipsis,
  LayoutPanelTop,
  RefreshCw,
  TriangleAlert,
  Warehouse,
} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { WarehouseDeactivateDialog, WarehouseEditDialog } from '../WarehouseDetailPage'
import {
  useDeactivateWarehouseMutation,
  useUpdateWarehouseMutation,
  useWarehouseQuery,
} from '../../hooks/use-warehouse'
import type { UpdateWarehouseFormValues } from '../../schemas/warehouse.schema'
import { getWarehouseCapabilities } from '../../utils/warehouse-capabilities'

interface WarehouseWorkspaceLayoutProps {
  readonly warehouseId: string
  readonly children: ReactNode
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('message' in error)) return null
  return typeof error.message === 'string' ? error.message : null
}

export function WarehouseWorkspaceLayout({ warehouseId, children }: WarehouseWorkspaceLayoutProps) {
  const pathname = usePathname()
  const role = useAuthStore((state) => state.user?.role ?? null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [deactivateErrorMessage, setDeactivateErrorMessage] = useState<string | null>(null)
  const warehouseQuery = useWarehouseQuery(warehouseId)
  const updateMutation = useUpdateWarehouseMutation()
  const deactivateMutation = useDeactivateWarehouseMutation()
  const capabilities = getWarehouseCapabilities(role)

  async function handleUpdate(values: UpdateWarehouseFormValues): Promise<boolean> {
    try {
      await updateMutation.mutateAsync({ warehouseId, request: values })
      toast.success('Đã cập nhật thông tin kho.')
      setIsEditDialogOpen(false)
      return true
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error) || 'Không thể cập nhật thông tin kho. Vui lòng thử lại.')
      return false
    }
  }

  function handleDeactivateDialogOpenChange(open: boolean) {
    setIsDeactivateDialogOpen(open)
    if (!open) setDeactivateErrorMessage(null)
  }

  async function handleDeactivate() {
    try {
      await deactivateMutation.mutateAsync(warehouseId)
      toast.success('Đã ngừng hoạt động kho.')
      setDeactivateErrorMessage(null)
      setIsDeactivateDialogOpen(false)
    } catch (error) {
      setDeactivateErrorMessage(
        getErrorMessage(error) || 'Không thể ngừng hoạt động kho. Vui lòng thử lại.'
      )
    }
  }

  if (warehouseQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
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
  const isActive = warehouse.status === 'Active'
  const overviewHref = APP_ROUTES.warehouseDetail(warehouseId)
  const layoutHref = APP_ROUTES.warehouseLayout(warehouseId)
  const isOverviewActive = pathname === overviewHref
  const isLayoutActive = pathname === layoutHref
  const canDeactivate = capabilities.canDeactivateWarehouse && isActive && isOverviewActive
  const hasHeaderActions = isActive && (capabilities.canEditWarehouse || canDeactivate)

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon-sm">
            <Link href={APP_ROUTES.warehouses} aria-label="Quay lại danh sách kho">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-primary text-xs font-medium">Kho hàng</p>
              <Badge variant={isActive ? 'outline' : 'destructive'}>
                {isActive ? 'Hoạt động' : warehouse.status}
              </Badge>
            </div>
            <h1 className="mt-0.5 truncate text-xl font-semibold">{warehouse.warehouseName}</h1>
            <p translate="no" className="text-muted-foreground mt-1 truncate font-mono text-xs">
              {warehouse.warehouseCode}
            </p>
          </div>
        </div>

        {hasHeaderActions ? (
          <div className="flex w-full gap-2 sm:w-auto">
            {capabilities.canEditWarehouse ? (
              <Button
                type="button"
                className="min-w-0 flex-1 sm:flex-none"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit3 data-icon="inline-start" aria-hidden="true" />
                Chỉnh sửa
              </Button>
            ) : null}

            {canDeactivate ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="min-w-0 flex-1 sm:flex-none">
                    <Ellipsis data-icon="inline-start" aria-hidden="true" />
                    Tác vụ kho
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      setDeactivateErrorMessage(null)
                      setIsDeactivateDialogOpen(true)
                    }}
                  >
                    <CircleOff aria-hidden="true" />
                    Ngừng hoạt động kho
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ) : null}
      </header>

      <nav aria-label="Điều hướng kho" className="flex min-w-0 gap-1 border-b pb-2">
        <Button asChild variant={isOverviewActive ? 'secondary' : 'ghost'} size="sm">
          <Link href={overviewHref as Route} aria-current={isOverviewActive ? 'page' : undefined}>
            <Warehouse data-icon="inline-start" aria-hidden="true" />
            Thông tin
          </Link>
        </Button>
        <Button asChild variant={isLayoutActive ? 'secondary' : 'ghost'} size="sm">
          <Link href={layoutHref as Route} aria-current={isLayoutActive ? 'page' : undefined}>
            <LayoutPanelTop data-icon="inline-start" aria-hidden="true" />
            Bố cục kho
          </Link>
        </Button>
      </nav>

      <main>{children}</main>

      <WarehouseEditDialog
        warehouse={warehouse}
        open={isEditDialogOpen}
        isPending={updateMutation.isPending}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdate}
      />

      <WarehouseDeactivateDialog
        warehouseName={warehouse.warehouseName}
        warehouseCode={warehouse.warehouseCode}
        open={isDeactivateDialogOpen}
        isPending={deactivateMutation.isPending}
        errorMessage={deactivateErrorMessage}
        onOpenChange={handleDeactivateDialogOpenChange}
        onConfirm={() => void handleDeactivate()}
      />
    </div>
  )
}
