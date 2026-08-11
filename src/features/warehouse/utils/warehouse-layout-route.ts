import type { Route } from 'next'
import { APP_ROUTES } from '@/routes/app-routes'
import type { ZoneResponse } from '@/types/warehouse'

export function buildWarehouseLayoutHref(
  warehouseId: string,
  zoneId: string | null,
  rackId: string | null
): Route {
  const params = new URLSearchParams()

  if (zoneId) {
    params.set('zone', zoneId)
    if (rackId) params.set('rack', rackId)
  }

  const query = params.toString()
  const pathname = APP_ROUTES.warehouseLayout(warehouseId)
  return (query ? `${pathname}?${query}` : pathname) as Route
}

export function getWarehouseLayoutSelection(
  zones: readonly ZoneResponse[],
  zoneId: string | null,
  rackId: string | null
) {
  const selectedZone = zones.find((zone) => zone.id === zoneId) ?? null
  const selectedRack = selectedZone?.racks.find((rack) => rack.id === rackId) ?? null

  return {
    selectedZoneId: selectedZone?.id ?? null,
    selectedRackId: selectedRack?.id ?? null,
  }
}
