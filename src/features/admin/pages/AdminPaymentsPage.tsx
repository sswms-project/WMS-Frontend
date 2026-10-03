'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { AdminPaymentsView } from '../components/AdminPayments'
import { useAdminPaymentsQuery, useAdminSubscriptionPlansQuery } from '../hooks/use-admin'

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>()
  const [planId, setPlanId] = useState<string>()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350).trim()
  const payments = useAdminPaymentsQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
    ...(planId ? { planId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    sortBy: 'createdAt',
    sortDirection: 1,
  })
  const plans = useAdminSubscriptionPlansQuery({ pageNumber: 1, pageSize: 100 })
  const resetPage = () => setPage(1)
  const hasFilters = Boolean(search || status || planId || dateFrom || dateTo)

  return (
    <AdminPaymentsView
      items={payments.data?.items ?? []}
      plans={plans.data?.items ?? []}
      totalCount={payments.data?.totalCount ?? 0}
      totalCompletedAmount={payments.data?.totalCompletedAmount ?? 0}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      planId={planId}
      dateFrom={dateFrom}
      dateTo={dateTo}
      isLoading={payments.isLoading}
      isFetching={payments.isFetching}
      isError={payments.isError}
      hasFilters={hasFilters}
      onSearchChange={(value) => {
        setSearch(value)
        resetPage()
      }}
      onStatusChange={(value) => {
        setStatus(value)
        resetPage()
      }}
      onPlanChange={(value) => {
        setPlanId(value)
        resetPage()
      }}
      onDateFromChange={(value) => {
        setDateFrom(value)
        resetPage()
      }}
      onDateToChange={(value) => {
        setDateTo(value)
        resetPage()
      }}
      onPageChange={setPage}
      onPageSizeChange={(value) => {
        setPageSize(value)
        resetPage()
      }}
      onClear={() => {
        setSearch('')
        setStatus(undefined)
        setPlanId(undefined)
        setDateFrom('')
        setDateTo('')
        resetPage()
      }}
      onRetry={() => void payments.refetch()}
    />
  )
}
