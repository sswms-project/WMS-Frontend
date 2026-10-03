'use client'

import { useState } from 'react'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { WarehouseTaskDirectory } from '../components/WarehouseTaskDirectory'
import { useMyWarehouseTaskHistoryQuery } from '../hooks/use-warehouse-task'

const PAGE_SIZE = 20

export default function MyWarehouseTaskHistoryPage() {
  const [page, setPage] = useState(1)
  const meQuery = useMeQuery()
  const managesWarehouseTasks = (meQuery.data?.permissions ?? []).includes(
    P.WAREHOUSE_TASKS_VIEW_ALL
  )
  const query = useMyWarehouseTaskHistoryQuery(
    { pageNumber: page, pageSize: PAGE_SIZE },
    managesWarehouseTasks ? 'managed' : 'mine'
  )
  return (
    <WarehouseTaskDirectory
      title={managesWarehouseTasks ? 'Lịch sử công việc kho' : 'Lịch sử công việc'}
      description="Các nhiệm vụ đã hoàn tất hoặc đã được xử lý."
      items={query.data?.items ?? []}
      totalCount={query.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      isError={query.isError}
      onPageChange={setPage}
      onRetry={() => void query.refetch()}
    />
  )
}
