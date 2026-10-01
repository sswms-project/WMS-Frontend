import { redirect } from 'next/navigation'
import { APP_ROUTES } from '@/routes/app-routes'

interface WarehouseDesignerRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseDesignerRoutePage({
  params,
}: WarehouseDesignerRoutePageProps) {
  const { warehouseId } = await params
  redirect(APP_ROUTES.warehouseLayoutDesigner(warehouseId))
}
