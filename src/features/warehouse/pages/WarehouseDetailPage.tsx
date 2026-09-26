'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { USER_ROLES } from '@/config/roles'
import { getApiErrorMessage } from '@/lib/api-error'
import { WarehouseOverview } from '../components/WarehouseDetailPage'
import {
  useConfigureQuarantineSlotMutation,
  useWarehouseLayoutQuery,
  useWarehouseQuery,
} from '../hooks/use-warehouse'

interface WarehouseDetailPageProps {
  readonly warehouseId: string
}

export function WarehouseDetailPage({ warehouseId }: WarehouseDetailPageProps) {
  const warehouseQuery = useWarehouseQuery(warehouseId)
  const layoutQuery = useWarehouseLayoutQuery(warehouseId, true)
  const meQuery = useMeQuery()
  const configureQuarantineSlotMutation = useConfigureQuarantineSlotMutation()

  if (!warehouseQuery.data) {
    return <Skeleton className="h-72" />
  }

  const slots = (layoutQuery.data ?? []).flatMap((zone) =>
    zone.racks.flatMap((rack) =>
      rack.slots
        .filter((slot) => slot.isActive)
        .map((slot) => ({
          id: slot.id,
          label: `${zone.zoneCode} · ${rack.rackCode} · ${slot.slotCode}`,
        }))
    )
  )
  const canConfigureQuarantine =
    meQuery.data?.role === USER_ROLES.TenantOwner &&
    (meQuery.data.permissions ?? []).includes('warehouses:update')

  return (
    <WarehouseOverview
      warehouse={warehouseQuery.data}
      slots={slots}
      canConfigureQuarantine={canConfigureQuarantine}
      isConfiguringQuarantine={configureQuarantineSlotMutation.isPending}
      onConfigureQuarantine={(slotId) => {
        configureQuarantineSlotMutation.mutate(
          { warehouseId, slotId },
          {
            onSuccess: () => toast.success('Đã cấu hình vị trí quarantine cho kho.'),
            onError: (error) =>
              toast.error(getApiErrorMessage(error, 'Không thể cấu hình vị trí quarantine.')),
          }
        )
      }}
    />
  )
}
