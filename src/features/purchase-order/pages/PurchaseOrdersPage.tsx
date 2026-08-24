'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PurchaseOrderDirectory } from '../components/PurchaseOrdersPage'
import { usePurchaseOrdersQuery } from '../hooks/use-purchase-orders'
import type { PurchaseOrderStatus } from '../types/purchase-order.types'

const PAGE_SIZE = 10

export default function PurchaseOrdersPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<PurchaseOrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = usePurchaseOrdersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })

  return (
    <PurchaseOrderDirectory
      items={query.data?.items ?? []}
      totalCount={query.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      searchText={searchText}
      status={status}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      isError={query.isError}
      onSearchChange={(value) => {
        setSearchText(value)
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
