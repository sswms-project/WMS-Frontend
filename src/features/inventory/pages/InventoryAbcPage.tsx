'use client'

import { useMemo, useState } from 'react'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryAbcDirectory } from '../components/InventoryAbcPage'
import { useInventoryAbcQuery } from '../hooks/use-inventory'

export default function InventoryAbcPage() {
  const meQuery = useMeQuery()
  const [warehouseId, setWarehouseId] = useState('')
  const params = useMemo(() => (warehouseId ? { warehouseId } : {}), [warehouseId])
  const abcQuery = useInventoryAbcQuery(params)
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })
  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )

  return (
    <InventoryAbcDirectory
      permissions={meQuery.data?.permissions ?? []}
      items={abcQuery.data ?? []}
      warehouseId={warehouseId}
      warehouseOptions={warehouseOptions}
      isLoading={abcQuery.isLoading}
      isFetching={abcQuery.isFetching}
      isError={abcQuery.isError}
      areWarehousesLoading={warehousesQuery.isLoading}
      areWarehousesError={warehousesQuery.isError}
      onWarehouseChange={setWarehouseId}
      onRetryWarehouses={() => void warehousesQuery.refetch()}
      onRetry={() => void abcQuery.refetch()}
    />
  )
}
