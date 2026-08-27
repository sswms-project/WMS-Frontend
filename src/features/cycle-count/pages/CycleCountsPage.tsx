'use client'

import { useMemo, useState } from 'react'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { CycleCountDirectory } from '../components/CycleCountDirectory'
import { useCycleCountsQuery } from '../hooks/use-cycle-count'
import type { CycleCountStatus } from '../types/cycle-count.types'

const PAGE_SIZE = 20
export default function CycleCountsPage() {
  const [page, setPage] = useState(1)
  const [warehouseId, setWarehouseId] = useState('')
  const [status, setStatus] = useState<'' | CycleCountStatus>('')
  const params = useMemo(
    () => ({
      pageNumber: page,
      pageSize: PAGE_SIZE,
      ...(warehouseId ? { warehouseId } : {}),
      ...(status ? { status } : {}),
    }),
    [page, warehouseId, status]
  )
  const query = useCycleCountsQuery(params)
  const me = useMeQuery()
  const warehouses = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true, isActive: true })
  const options = useMemo(
    () =>
      (warehouses.data?.items ?? []).map((w) => ({
        value: w.id,
        label: `${w.warehouseCode} · ${w.warehouseName}`,
      })),
    [warehouses.data?.items]
  )
  return (
    <CycleCountDirectory
      permissions={me.data?.permissions ?? []}
      items={query.data?.items ?? []}
      totalCount={query.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      warehouseId={warehouseId}
      status={status}
      warehouses={options}
      canCreate={me.data?.permissions.includes('cycle-counts:create') ?? false}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      isError={query.isError}
      onWarehouseChange={(value) => {
        setWarehouseId(value)
        setPage(1)
      }}
      onStatusChange={(value) => {
        setStatus(value)
        setPage(1)
      }}
      onPageChange={setPage}
      onRetry={() => void query.refetch()}
    />
  )
}
