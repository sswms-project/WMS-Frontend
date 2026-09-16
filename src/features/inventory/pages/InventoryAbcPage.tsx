'use client'

import { useMemo, useState } from 'react'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryAbcDirectory } from '../components/InventoryAbcPage'
import { useInventoryAbcQuery, useRunInventoryAbcMutation } from '../hooks/use-inventory'
import { toast } from 'sonner'

export default function InventoryAbcPage() {
  const meQuery = useMeQuery()
  const [warehouseId, setWarehouseId] = useState('')
  const [historicalPeriodDays, setHistoricalPeriodDays] = useState(90)
  const params = useMemo(() => ({ warehouseId }), [warehouseId])
  const abcQuery = useInventoryAbcQuery(params, Boolean(warehouseId))
  const runMutation = useRunInventoryAbcMutation()
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
      historicalPeriodDays={historicalPeriodDays}
      isRunning={runMutation.isPending}
      onHistoricalPeriodDaysChange={setHistoricalPeriodDays}
      onRun={() => {
        if (!warehouseId || historicalPeriodDays < 1 || historicalPeriodDays > 366) return
        void runMutation
          .mutateAsync({ warehouseId, historicalPeriodDays })
          .then(() => toast.success('Đã cập nhật phân loại ABC cho kho.'))
          .catch(() => toast.error('Không thể chạy phân loại ABC.'))
      }}
    />
  )
}
