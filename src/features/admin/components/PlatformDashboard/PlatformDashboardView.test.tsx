import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PlatformDashboardResponse } from '../../types/admin.types'
import { PlatformDashboardView } from './PlatformDashboardView'

const dashboard: PlatformDashboardResponse = {
  tenantSummary: {
    total: 2,
    active: 1,
    suspended: 1,
    pending: 0,
    inactive: 0,
    newLast30Days: 1,
    newThisMonth: 1,
    newThisYear: 2,
  },
  subscriptionSummary: { active: 1, expired: 1, cancelled: 0 },
  revenueSummary: { totalCompleted: 500000, thisMonthCompleted: 500000, thisYearCompleted: 500000 },
  planDistribution: [],
  serviceHealth: [
    { service: 'Redis', status: 'Degraded', checkedAt: '2026-09-02T00:00:00Z', message: 'Timeout' },
  ],
}

describe('PlatformDashboardView', () => {
  it('keeps business metrics visible when a dependency is degraded', () => {
    render(
      <PlatformDashboardView
        data={dashboard}
        isLoading={false}
        isError={false}
        isFetching={false}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Redis')).toBeInTheDocument()
    expect(screen.getByText('Degraded')).toBeInTheDocument()
    expect(screen.getByText('Chưa có đăng ký hiệu lực.')).toBeInTheDocument()
  })
})
