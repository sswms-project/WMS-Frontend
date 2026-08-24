'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { InboundPageHeader } from '../components/InboundWorkspace'
import { PutawayDirectory } from '../components/PutawayPage'
import { usePutawayTasksQuery } from '../hooks/use-inbound'

const PAGE_SIZE = 10

export default function InboundPutawayPage() {
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = usePutawayTasksQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
  })
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <InboundPageHeader
        title="Cất hàng"
        description="Phân bổ hàng khả dụng vào các vị trí còn sức chứa."
      />
      <PutawayDirectory
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onRetry={() => void query.refetch()}
      />
    </div>
  )
}
