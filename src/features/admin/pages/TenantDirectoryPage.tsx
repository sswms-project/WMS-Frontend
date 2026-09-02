'use client'

import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { TenantDirectoryView } from '../components/TenantDirectory'
import { useAdminSubscriptionPlansQuery, useTenantsQuery } from '../hooks/use-admin'
import type { TenantStatus, TenantSubscriptionStatus } from '../types/admin.types'

const PAGE_SIZE = 20

export default function TenantDirectoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TenantStatus>()
  const [subscriptionStatus, setSubscriptionStatus] = useState<TenantSubscriptionStatus>()
  const [planId, setPlanId] = useState<string>()
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'tenantName' | 'status' | 'subscriptionEndDate'
  >('createdAt')
  const debouncedSearch = useDebouncedValue(search, 350).trim()
  const tenants = useTenantsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
    ...(subscriptionStatus ? { subscriptionStatus } : {}),
    ...(planId ? { planId } : {}),
    sortBy,
    sortDirection: sortBy === 'createdAt' ? 1 : 0,
  })
  const plans = useAdminSubscriptionPlansQuery({ pageNumber: 1, pageSize: 100 })
  const resetPage = () => setPage(1)

  return (
    <TenantDirectoryView
      items={tenants.data?.items ?? []}
      plans={plans.data?.items ?? []}
      totalCount={tenants.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      status={status}
      subscriptionStatus={subscriptionStatus}
      planId={planId}
      sortBy={sortBy}
      isLoading={tenants.isLoading}
      isFetching={tenants.isFetching}
      isError={tenants.isError}
      onSearchChange={(value) => {
        setSearch(value)
        resetPage()
      }}
      onStatusChange={(value) => {
        setStatus(value)
        resetPage()
      }}
      onSubscriptionStatusChange={(value) => {
        setSubscriptionStatus(value)
        resetPage()
      }}
      onPlanChange={(value) => {
        setPlanId(value)
        resetPage()
      }}
      onSortChange={(value) => {
        setSortBy(value)
        resetPage()
      }}
      onPageChange={setPage}
      onClear={() => {
        setSearch('')
        setStatus(undefined)
        setSubscriptionStatus(undefined)
        setPlanId(undefined)
        setSortBy('createdAt')
        resetPage()
      }}
      onRetry={() => void tenants.refetch()}
    />
  )
}
