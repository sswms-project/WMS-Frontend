'use client'

import { RefreshCw, UserRoundSearch } from 'lucide-react'
import { useState } from 'react'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useFormerStaffQuery } from '../../../hooks/use-staff'
import type { FormerStaffResponse, StaffQuery } from '../../../types/staff.types'
import { StaffDirectoryToolbar } from '../StaffDirectoryToolbar'
import { FormerStaffHistorySheet } from './FormerStaffHistorySheet'
import { FormerStaffTable } from './FormerStaffTable'

interface FormerStaffPanelProps {
  readonly enabled: boolean
  readonly canEditHistory: boolean
}

export function FormerStaffPanel({ enabled, canEditHistory }: FormerStaffPanelProps) {
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedPerson, setSelectedPerson] = useState<FormerStaffResponse | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 300)
  const params: StaffQuery = {
    top: pageSize,
    skip: (page - 1) * pageSize,
    needTotalCount: true,
    ...(debouncedSearchText ? { searchText: debouncedSearchText } : {}),
  }
  const query = useFormerStaffQuery(params, enabled)
  const people = query.data?.items ?? []

  return (
    <>
      <OperationalListPanel aria-labelledby="former-staff-title">
        <div className="flex min-h-12 flex-col gap-1 border-b px-3 py-3 sm:px-4">
          <h2 id="former-staff-title" className="text-sm font-semibold">
            Nhân sự đã nghỉ việc
          </h2>
          <p className="text-muted-foreground text-xs">
            {query.data?.totalCount ?? 0} người, gộp các lần làm việc theo email
          </p>
        </div>

        <StaffDirectoryToolbar
          searchText={searchText}
          isFetching={query.isFetching}
          onSearchChange={(value) => {
            setSearchText(value)
            setPage(1)
          }}
        />

        {query.isLoading && (
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex h-16 items-center gap-3 px-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {query.isError && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <UserRoundSearch className="text-destructive size-10" aria-hidden="true" />
            <p className="text-sm font-medium">Không thể tải danh sách nhân sự đã nghỉ việc</p>
            <Button type="button" variant="outline" onClick={() => void query.refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Thử lại
            </Button>
          </div>
        )}

        {!query.isLoading && !query.isError && people.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-1 px-4 text-center">
            <p className="text-sm font-medium">Chưa có nhân sự đã nghỉ việc</p>
            <p className="text-muted-foreground text-xs">
              {debouncedSearchText
                ? 'Thử tên hoặc email khác.'
                : 'Những người bị chấm dứt làm việc sẽ xuất hiện ở đây.'}
            </p>
          </div>
        )}

        {people.length > 0 && (
          <>
            <FormerStaffTable people={people} onViewHistory={setSelectedPerson} />
            <OperationalPagination
              page={page}
              pageSize={pageSize}
              totalCount={query.data?.totalCount ?? 0}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value)
                setPage(1)
              }}
            />
          </>
        )}
      </OperationalListPanel>

      <FormerStaffHistorySheet
        person={selectedPerson}
        canEdit={canEditHistory}
        onOpenChange={(open) => !open && setSelectedPerson(null)}
      />
    </>
  )
}
