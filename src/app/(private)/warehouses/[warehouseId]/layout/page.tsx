import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseLayoutPage } from '@/features/warehouse/pages'

interface WarehouseLayoutRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseLayoutRoutePage({ params }: WarehouseLayoutRoutePageProps) {
  const { warehouseId } = await params

  return (
    <Suspense fallback={<Skeleton className="h-[32rem]" />}>
      <WarehouseLayoutPage warehouseId={warehouseId} />
    </Suspense>
  )
}
