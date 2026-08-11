'use client'

import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseLocationBarcodeView } from '../components/WarehouseBarcodePage'
import { useLocationBarcodeQuery } from '../hooks/use-warehouse'
import type { WarehouseLocationType } from '../types/warehouse.types'

interface WarehouseLocationBarcodePageProps {
  readonly warehouseId: string
  readonly locationType: WarehouseLocationType
  readonly locationId: string
}

export function WarehouseLocationBarcodePage({
  warehouseId,
  locationType,
  locationId,
}: WarehouseLocationBarcodePageProps) {
  const barcodeQuery = useLocationBarcodeQuery(warehouseId, locationType, locationId)

  if (barcodeQuery.isLoading) return <Skeleton className="mx-auto h-[28rem] max-w-2xl" />

  if (barcodeQuery.isError || !barcodeQuery.data) {
    return (
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert className="text-destructive" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Không thể tải barcode</EmptyTitle>
          <EmptyDescription>
            Vị trí có thể đã ngừng hoạt động hoặc bạn không có quyền tạo barcode.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" onClick={() => void barcodeQuery.refetch()}>
          <RefreshCw data-icon="inline-start" aria-hidden="true" />
          Thử lại
        </Button>
      </Empty>
    )
  }

  return <WarehouseLocationBarcodeView warehouseId={warehouseId} barcode={barcodeQuery.data} />
}
