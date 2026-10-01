import { WarehouseDesignerPage } from '@/features/warehouse/pages'

interface WarehouseLayoutDesignerRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseLayoutDesignerRoutePage({
  params,
}: WarehouseLayoutDesignerRoutePageProps) {
  const { warehouseId } = await params
  return <WarehouseDesignerPage warehouseId={warehouseId} />
}
