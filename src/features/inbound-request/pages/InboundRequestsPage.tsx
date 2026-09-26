'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { InboundRequestDirectory } from '../components/InboundRequestsPage'
import { useInboundRequestsQuery } from '../hooks/use-inbound-requests'
import type { InboundRequestStatus } from '../types/inbound-request.types'

export default function InboundRequestsPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<InboundRequestStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = useInboundRequestsQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })

  return (
    <InboundRequestDirectory
      items={query.data?.items ?? []}
      totalCount={query.data?.totalCount ?? 0}
      page={page}
      pageSize={pageSize}
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
      onPageSizeChange={(value) => {
        setPageSize(value)
        setPage(1)
      }}
      onRetry={() => void query.refetch()}
    />
  )
}
