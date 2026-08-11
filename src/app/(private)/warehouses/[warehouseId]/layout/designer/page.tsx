import { WarehouseDesignerPage } from '@/features/warehouse/pages'

interface WarehouseDesignerRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseDesignerRoutePage({
  params,
}: WarehouseDesignerRoutePageProps) {
  const { warehouseId } = await params
  return <WarehouseDesignerPage warehouseId={warehouseId} />
}
