'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { InboundPageHeader } from '../components/InboundWorkspace'
import { ReceiptDirectory } from '../components/ReceiptsPage'
import { useInboundReceiptsQuery } from '../hooks/use-inbound'
import type { InboundReceiptStatus } from '../types/inbound.types'

const PAGE_SIZE = 10

export default function InboundReceiptsPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<InboundReceiptStatus | ''>('')
  const [page, setPage] = useState(1)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = useInboundReceiptsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <InboundPageHeader
        title="Phiếu nhập"
        description="Theo dõi bản nháp, phiếu chờ duyệt và lịch sử nhập kho."
      />
      <ReceiptDirectory
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
    </div>
  )
}
