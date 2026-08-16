import { notFound } from 'next/navigation'
import { WarehouseLocationBarcodePage } from '@/features/warehouse/pages'
import { parseWarehouseLocationType } from '@/features/warehouse/utils/warehouse-location-type'

interface WarehouseLocationBarcodeRoutePageProps {
  readonly params: Promise<{ warehouseId: string; locationType: string; locationId: string }>
}

export default async function WarehouseLocationBarcodeRoutePage({
  params,
}: WarehouseLocationBarcodeRoutePageProps) {
  const { warehouseId, locationType, locationId } = await params
  const parsedLocationType = parseWarehouseLocationType(locationType)
  if (!parsedLocationType) notFound()
  return (
    <WarehouseLocationBarcodePage
      warehouseId={warehouseId}
      locationType={parsedLocationType}
      locationId={locationId}
    />
  )
}
