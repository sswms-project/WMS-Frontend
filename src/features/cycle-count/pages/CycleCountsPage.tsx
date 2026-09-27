'use client'

import { useMemo, useState } from 'react'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { CycleCountDirectory } from '../components/CycleCountDirectory'
import { useCycleCountsQuery } from '../hooks/use-cycle-count'
import type { CycleCountStatus } from '../types/cycle-count.types'

export default function CycleCountsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [warehouseId, setWarehouseId] = useState('')
  const [status, setStatus] = useState<'' | CycleCountStatus>('')
  const params = useMemo(
    () => ({
      pageNumber: page,
      pageSize,
      ...(warehouseId ? { warehouseId } : {}),
      ...(status ? { status } : {}),
    }),
    [page, pageSize, warehouseId, status]
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
      pageSize={pageSize}
      warehouseId={warehouseId}
      status={status}
      warehouses={options}
      canCreate={me.data?.permissions.includes(P.CYCLE_COUNTS_CREATE) ?? false}
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
      onPageSizeChange={(value) => {
        setPageSize(value)
        setPage(1)
      }}
      onRetry={() => void query.refetch()}
    />
  )
}
