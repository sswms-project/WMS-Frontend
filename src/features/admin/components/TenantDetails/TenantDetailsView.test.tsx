import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TenantDetailsResponse } from '../../types/admin.types'
import { TenantDetailsView } from './TenantDetailsView'

const tenant: TenantDetailsResponse = {
  id: 'eb613f1d-fbae-490f-a81f-aa5aea029519',
  tenantName: 'Kovia Logistics',
  email: 'owner@example.com',
  phone: '0900000000',
  address: null,
  status: 'Pending',
  createdAt: '2026-09-28T10:00:00Z',
  concurrencyToken: 'token',
  owner: {
    id: '11111111-1111-4111-8111-111111111111',
    fullName: 'Nguyễn An',
    email: 'owner@example.com',
    phone: null,
    status: 'Active',
    emailVerified: true,
    lastLoginAt: null,
  },
  usage: { activeUsers: 1, totalUsers: 1, activeWarehouses: 0, totalWarehouses: 0 },
  subscription: null,
  billing: {
    totalCompletedRevenue: 0,
    lastPaymentId: null,
    lastInvoiceNumber: null,
    lastPaymentAmount: null,
    lastPaidAt: null,
  },
}

describe('TenantDetailsView', () => {
  it('uses the fluid layout and presents tenant status without exposing the tenant ID', () => {
    const { container } = render(
      <TenantDetailsView
        data={tenant}
        isLoading={false}
        isError={false}
        isFetching={false}
        isPending={false}
        onRetry={vi.fn()}
        onStateAction={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    )

    expect(screen.getAllByText('Chờ kích hoạt').length).toBeGreaterThan(0)
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText(tenant.id)).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('w-full', 'min-w-0', 'flex-1')
    expect(container.firstElementChild).not.toHaveClass('mx-auto', 'max-w-[1440px]')
  })

  it('translates subscription status and billing cycles', () => {
    render(
      <TenantDetailsView
        data={{
          ...tenant,
          subscription: {
            id: '22222222-2222-4222-8222-222222222222',
            planId: '33333333-3333-4333-8333-333333333333',
            planName: 'Premium',
            billingCycle: 'Monthly',
            startDate: '2026-09-01T00:00:00Z',
            endDate: '2026-10-01T00:00:00Z',
            status: 'Active',
            autoRenew: false,
            cancelledAt: null,
            pendingPlanId: '44444444-4444-4444-8444-444444444444',
            pendingPlanName: 'Plus',
            pendingBillingCycle: 'Yearly',
          },
        }}
        isLoading={false}
        isError={false}
        isFetching={false}
        isPending={false}
        onRetry={vi.fn()}
        onStateAction={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    )

    expect(screen.getByText('Hàng tháng')).toBeInTheDocument()
    expect(screen.getByText('Hàng năm')).toBeInTheDocument()
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument()
    expect(screen.queryByText('Monthly')).not.toBeInTheDocument()
  })
})
