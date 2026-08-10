'use client'

import { RefreshCw, TriangleAlert } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseLayoutView } from '../components/WarehouseDetailPage'
import { useWarehouseLayoutQuery } from '../hooks/use-warehouse'
import {
  buildWarehouseLayoutHref,
  getWarehouseLayoutSelection,
} from '../utils/warehouse-layout-route'

interface WarehouseLayoutPageProps {
  readonly warehouseId: string
}

export function WarehouseLayoutPage({ warehouseId }: WarehouseLayoutPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const layoutQuery = useWarehouseLayoutQuery(warehouseId, true)

  if (layoutQuery.isLoading) {
    return <Skeleton className="h-[32rem]" />
  }

  if (layoutQuery.isError) {
    return (
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert className="text-destructive" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Không thể tải bố cục kho</EmptyTitle>
          <EmptyDescription>
            Dữ liệu bố cục chưa sẵn sàng hoặc bạn không có quyền truy cập.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" onClick={() => void layoutQuery.refetch()}>
          <RefreshCw data-icon="inline-start" aria-hidden="true" />
          Thử lại
        </Button>
      </Empty>
    )
  }

  const zones = layoutQuery.data ?? []
  const selection = getWarehouseLayoutSelection(
    zones,
    searchParams.get('zone'),
    searchParams.get('rack')
  )

  function navigate(zoneId: string | null, rackId: string | null) {
    router.push(buildWarehouseLayoutHref(warehouseId, zoneId, rackId), { scroll: false })
  }

  return (
    <WarehouseLayoutView
      zones={zones}
      selectedZoneId={selection.selectedZoneId}
      selectedRackId={selection.selectedRackId}
      onSelectZone={(zoneId) => navigate(zoneId, null)}
      onSelectRack={(rackId) => navigate(selection.selectedZoneId, rackId)}
      onBackToZones={() => navigate(null, null)}
      onBackToRacks={() => navigate(selection.selectedZoneId, null)}
    />
  )
}
