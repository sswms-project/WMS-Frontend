'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  CircleOff,
  DraftingCompass,
  Edit3,
  Ellipsis,
  LayoutPanelTop,
  MapPinned,
  RefreshCw,
  TriangleAlert,
  Warehouse,
} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { useWarehouseLayoutEditorStore } from '@/stores/warehouse-layout-editor.store'
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
  const router = useRouter()
  const role = useAuthStore((state) => state.user?.role ?? null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [deactivateErrorMessage, setDeactivateErrorMessage] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<Route | null>(null)
  const hasUnsavedLayout = useWarehouseLayoutEditorStore((state) =>
    state.dirtyWarehouseIds.has(warehouseId)
  )
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
      logger.error(error)
      toast.error(getErrorMessage(error) || 'Không thể cập nhật thông tin kho. Vui lòng thử lại.')
      return false
    }
  }

  function handleDeactivateDialogOpenChange(open: boolean) {
    setIsDeactivateDialogOpen(open)
    if (!open) setDeactivateErrorMessage(null)
  }

  function handleWorkspaceNavigation(event: MouseEvent<HTMLAnchorElement>, href: Route) {
    if (
      !isDesignerActive ||
      !hasUnsavedLayout ||
      href === pathname ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    setPendingNavigation(href)
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
  const designerHref = APP_ROUTES.warehouseLayoutDesigner(warehouseId)
  const locationsHref = APP_ROUTES.warehouseLocations(warehouseId)
  const isOverviewActive = pathname === overviewHref
  const isLayoutActive = pathname === layoutHref
  const isDesignerActive = pathname === designerHref
  const isLocationsActive = pathname === locationsHref || pathname.startsWith(`${locationsHref}/`)
  const canDeactivate = capabilities.canDeactivateWarehouse && isActive && isOverviewActive
  const hasHeaderActions = isActive && (capabilities.canEditWarehouse || canDeactivate)

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-5',
        isDesignerActive ? 'max-w-none' : 'max-w-[1180px]'
      )}
    >
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon-sm">
            <Link
              href={APP_ROUTES.warehouses}
              aria-label="Quay lại danh sách kho"
              onClick={(event) => handleWorkspaceNavigation(event, APP_ROUTES.warehouses)}
            >
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

      <nav aria-label="Điều hướng kho" className="flex min-w-0 gap-1 overflow-x-auto border-b pb-2">
        <Button asChild variant={isOverviewActive ? 'secondary' : 'ghost'} size="sm">
          <Link
            href={overviewHref as Route}
            aria-current={isOverviewActive ? 'page' : undefined}
            onClick={(event) => handleWorkspaceNavigation(event, overviewHref as Route)}
          >
            <Warehouse data-icon="inline-start" aria-hidden="true" />
            Thông tin
          </Link>
        </Button>
        <Button asChild variant={isLayoutActive ? 'secondary' : 'ghost'} size="sm">
          <Link
            href={layoutHref as Route}
            aria-current={isLayoutActive ? 'page' : undefined}
            onClick={(event) => handleWorkspaceNavigation(event, layoutHref as Route)}
          >
            <LayoutPanelTop data-icon="inline-start" aria-hidden="true" />
            Bố cục kho
          </Link>
        </Button>
        <Button asChild variant={isDesignerActive ? 'secondary' : 'ghost'} size="sm">
          <Link
            href={designerHref as Route}
            aria-current={isDesignerActive ? 'page' : undefined}
            onClick={(event) => handleWorkspaceNavigation(event, designerHref as Route)}
          >
            <DraftingCompass data-icon="inline-start" aria-hidden="true" />
            Thiết kế
          </Link>
        </Button>
        <Button asChild variant={isLocationsActive ? 'secondary' : 'ghost'} size="sm">
          <Link
            href={locationsHref as Route}
            aria-current={isLocationsActive ? 'page' : undefined}
            onClick={(event) => handleWorkspaceNavigation(event, locationsHref as Route)}
          >
            <MapPinned data-icon="inline-start" aria-hidden="true" />
            Vị trí
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

      <AlertDialog
        open={Boolean(pendingNavigation)}
        onOpenChange={(open) => !open && setPendingNavigation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời trình thiết kế?</AlertDialogTitle>
            <AlertDialogDescription>
              Các thay đổi bố cục chưa lưu sẽ bị mất. Hãy lưu sơ đồ trước nếu bạn muốn giữ lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingNavigation) router.push(pendingNavigation)
                setPendingNavigation(null)
              }}
            >
              Rời trang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
