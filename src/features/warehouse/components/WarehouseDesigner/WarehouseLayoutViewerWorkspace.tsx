'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Route } from 'next'
import { Boxes, Maximize, PencilRuler, SearchX, ZoomIn, ZoomOut } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useInventoryQuery } from '@/features/inventory/hooks/use-inventory'
import {
  formatInventoryDateOnly,
  formatInventoryQuantity,
} from '@/features/inventory/utils/inventory-format'
import { APP_ROUTES } from '@/routes/app-routes'
import type {
  WarehouseLayoutEditorScene,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import { DesignerToolbox } from './DesignerToolbox'
import type { WarehouseCanvasHandle } from './WarehouseCanvas'

const WarehouseCanvas = dynamic(
  () => import('./WarehouseCanvas').then((module) => module.WarehouseCanvas),
  { ssr: false, loading: () => <Skeleton className="h-full min-h-[28rem] w-full" /> }
)

interface WarehouseLayoutViewerWorkspaceProps {
  readonly warehouseId: string
  readonly warehouseName: string
  readonly scene: WarehouseLayoutEditorScene
  readonly canConfigure: boolean
}

function ViewerIconButton({
  label,
  onClick,
  children,
}: {
  readonly label: string
  readonly onClick: () => void
  readonly children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" size="icon-sm" variant="ghost" aria-label={label} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function WarehouseLayoutViewerWorkspace({
  warehouseId,
  warehouseName,
  scene,
  canConfigure,
}: WarehouseLayoutViewerWorkspaceProps) {
  const canvasRef = useRef<WarehouseCanvasHandle>(null)
  const [selection, setSelection] = useState<WarehouseLayoutSelection | null>(null)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false)
  const inventoryParams = useMemo(() => {
    const base = { pageNumber: 1, pageSize: 50, warehouseId }
    if (!selection || selection.kind === 'decoration') return base
    if (selection.kind === 'zone') return { ...base, zoneId: selection.id }
    if (selection.kind === 'rack') return { ...base, rackId: selection.id }
    return { ...base, slotId: selection.id }
  }, [selection, warehouseId])
  const inventoryQuery = useInventoryQuery(inventoryParams, Boolean(selection))

  const tree = (
    <DesignerToolbox
      scene={scene}
      selection={selection}
      canConfigure={false}
      mode="viewer"
      onCreateZone={() => undefined}
      onCreateRack={() => undefined}
      onCreateDecoration={() => undefined}
      onSelect={(nextSelection) => setSelection(nextSelection)}
    />
  )

  const inventory = (
    <section
      className="flex min-h-0 flex-1 flex-col border-t"
      aria-labelledby="viewer-inventory-title"
    >
      <div className="shrink-0 px-3 py-2.5">
        <h2 id="viewer-inventory-title" className="text-sm font-semibold">
          Hàng hóa tại vị trí
        </h2>
        <p className="text-muted-foreground mt-0.5 text-[11px]">
          {selection
            ? 'Dữ liệu tồn theo phạm vi đang chọn.'
            : 'Chọn một vị trí trên cây hoặc sơ đồ.'}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {!selection ? (
          <Empty className="h-full min-h-0 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Chưa chọn vị trí</EmptyTitle>
              <EmptyDescription>
                Chọn khu vực, kệ hoặc vị trí lưu trữ để xem tồn kho.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : inventoryQuery.isLoading ? (
          <div className="space-y-2 p-3" aria-label="Đang tải hàng hóa">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : inventoryQuery.isError ? (
          <div className="text-destructive p-3 text-xs" role="alert">
            Không thể tải hàng hóa tại vị trí. Hãy thử chọn lại vị trí.
          </div>
        ) : (inventoryQuery.data?.items.length ?? 0) === 0 ? (
          <p className="text-muted-foreground p-4 text-center text-xs">Vị trí chưa có hàng hóa.</p>
        ) : (
          <Table className="min-w-[46rem]">
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead>Mã hàng</TableHead>
                <TableHead>Tên hàng</TableHead>
                <TableHead>Tồn thực tế</TableHead>
                <TableHead>Đang giữ</TableHead>
                <TableHead>Khả dụng</TableHead>
                <TableHead>ĐVT</TableHead>
                <TableHead>Số lô</TableHead>
                <TableHead>Hạn dùng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryQuery.data!.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell translate="no" className="font-mono text-[11px]">
                    {item.sku}
                  </TableCell>
                  <TableCell className="max-w-44 truncate">{item.productName}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInventoryQuantity(item.quantityOnHand)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatInventoryQuantity(item.reservedQuantity + item.holdQuantity)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatInventoryQuantity(item.availableQuantity)}
                  </TableCell>
                  <TableCell>{item.unitName || '—'}</TableCell>
                  <TableCell translate="no">{item.lotNumber || '—'}</TableCell>
                  <TableCell>
                    {item.expiryDate ? formatInventoryDateOnly(item.expiryDate) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  )

  return (
    <section
      className="bg-surface-container-lowest flex h-[calc(100dvh-17rem)] min-h-[28rem] min-w-0 flex-col overflow-hidden border"
      aria-label={`Sơ đồ ${warehouseName}`}
    >
      <header className="flex min-h-12 shrink-0 items-center gap-3 border-b px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Sơ đồ {warehouseName}</h2>
          <p className="text-muted-foreground text-[11px]">Chọn vị trí để đối chiếu hàng hóa.</p>
        </div>
        {canConfigure ? (
          <Button asChild size="sm" className="ml-auto">
            <Link href={APP_ROUTES.warehouseLayoutDesigner(warehouseId) as Route}>
              <PencilRuler data-icon="inline-start" aria-hidden="true" />
              Sửa thiết kế
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[22rem] shrink-0 flex-col border-r lg:flex">
          <div className="min-h-0 flex-[3]">{tree}</div>
          <div className="flex min-h-0 flex-[2]">{inventory}</div>
        </aside>
        <div className="relative min-h-0 min-w-0 flex-1">
          <WarehouseCanvas
            ref={canvasRef}
            scene={scene}
            selection={selection}
            canConfigure={false}
            isGridVisible
            onSelect={setSelection}
            onGeometryChange={() => undefined}
            onZoomChange={setZoomPercent}
            onPaletteDrop={() => undefined}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="absolute top-3 left-3 lg:hidden"
            onClick={() => setIsLocationSheetOpen(true)}
          >
            <Boxes data-icon="inline-start" aria-hidden="true" />
            Vị trí & hàng hóa
          </Button>
        </div>
      </div>

      <footer className="bg-surface-container-lowest flex min-h-11 shrink-0 items-center border-t px-3 py-1.5">
        <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent size-2.5 rounded-[2px] border" aria-hidden="true" /> Có hàng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-card size-2.5 rounded-[2px] border" aria-hidden="true" /> Trống
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="border-primary bg-primary/10 size-2.5 rounded-[2px] border-2"
              aria-hidden="true"
            />
            Đang chọn
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ViewerIconButton label="Thu nhỏ" onClick={() => canvasRef.current?.zoomOut()}>
            <ZoomOut aria-hidden="true" />
          </ViewerIconButton>
          <output className="text-muted-foreground w-12 text-center font-mono text-[11px] tabular-nums">
            {zoomPercent}%
          </output>
          <ViewerIconButton label="Phóng to" onClick={() => canvasRef.current?.zoomIn()}>
            <ZoomIn aria-hidden="true" />
          </ViewerIconButton>
          <ViewerIconButton label="Vừa màn hình" onClick={() => canvasRef.current?.fit()}>
            <Maximize aria-hidden="true" />
          </ViewerIconButton>
        </div>
      </footer>

      <Sheet open={isLocationSheetOpen} onOpenChange={setIsLocationSheetOpen}>
        <SheetContent side="left" className="w-[min(92vw,28rem)] gap-0 p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>Vị trí và hàng hóa</SheetTitle>
            <SheetDescription>Chọn vị trí và xem hàng hóa trong kho.</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col pt-10">
            <div className="min-h-0 flex-[3]">{tree}</div>
            <div className="flex min-h-0 flex-[2]">{inventory}</div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}
