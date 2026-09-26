'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { InboundPageHeader } from '../components/InboundWorkspace'
import { ReceiptDirectory } from '../components/ReceiptsPage'
import { useGoodsReceiptsQuery } from '../hooks/use-inbound'
import type { GoodsReceiptStatus } from '../types/inbound.types'

export default function GoodsReceiptsPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<GoodsReceiptStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = useGoodsReceiptsQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <InboundPageHeader title="Phiếu nhận hàng" />
      <ReceiptDirectory
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
    </div>
  )
}
