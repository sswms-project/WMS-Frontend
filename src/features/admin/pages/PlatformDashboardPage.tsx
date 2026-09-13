'use client'

import { PlatformDashboardView } from '../components/PlatformDashboard'
import { usePlatformDashboardQuery } from '../hooks/use-admin'

export default function PlatformDashboardPage() {
  const query = usePlatformDashboardQuery()
  return (
    <PlatformDashboardView
      data={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      isFetching={query.isFetching}
      onRetry={() => void query.refetch()}
    />
  )
}
