import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseLocationsPage } from '@/features/warehouse/pages'

interface WarehouseLocationsRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseLocationsRoutePage({
  params,
}: WarehouseLocationsRoutePageProps) {
  const { warehouseId } = await params
  return (
    <Suspense fallback={<Skeleton className="h-[32rem]" />}>
      <WarehouseLocationsPage warehouseId={warehouseId} />
    </Suspense>
  )
}
