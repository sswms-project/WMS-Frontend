import { WarehouseDesignerPage } from '@/features/warehouse/pages'

interface WarehouseLayoutViewerRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseLayoutViewerRoutePage({
  params,
}: WarehouseLayoutViewerRoutePageProps) {
  const { warehouseId } = await params
  return <WarehouseDesignerPage warehouseId={warehouseId} viewOnly />
}
