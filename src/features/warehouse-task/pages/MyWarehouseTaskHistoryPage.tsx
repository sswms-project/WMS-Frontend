'use client'

import { useState } from 'react'
import { WarehouseTaskDirectory } from '../components/WarehouseTaskDirectory'
import { useMyWarehouseTaskHistoryQuery } from '../hooks/use-warehouse-task'

const PAGE_SIZE = 20

export default function MyWarehouseTaskHistoryPage() {
  const [page, setPage] = useState(1)
  const query = useMyWarehouseTaskHistoryQuery({ pageNumber: page, pageSize: PAGE_SIZE })
  return (
    <WarehouseTaskDirectory
      title="Lịch sử công việc"
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
