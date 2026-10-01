import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { APP_ROUTES } from '@/routes/app-routes'

interface WarehouseLocationsRoutePageProps {
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseLocationsRoutePage({
  params,
}: WarehouseLocationsRoutePageProps) {
  const { warehouseId } = await params
  redirect(APP_ROUTES.warehouseLayout(warehouseId) as Route)
}
