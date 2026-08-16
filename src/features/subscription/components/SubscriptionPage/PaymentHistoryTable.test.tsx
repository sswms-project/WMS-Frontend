import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { PaymentHistoryFilterState, PaymentResponse } from '../../types/subscription.types'

const filters: PaymentHistoryFilterState = {
  searchText: '',
  planId: 'all',
  status: 'all',
}

const payments: readonly PaymentResponse[] = [
  {
    id: 'completed-payment',
    subscriptionId: 'subscription-1',
    planId: 'pro',
    planName: 'Pro',
    invoiceNumber: 'INV-001',
    amount: 200000,
    status: 'Completed',
    paidAt: '2026-08-01T10:00:00+07:00',
    createdAt: '2026-08-01T09:00:00+07:00',
  },
  {
    id: 'pending-payment',
    subscriptionId: 'subscription-2',
    planId: null,
    planName: null,
    invoiceNumber: 'INV-002',
    amount: 100000,
    status: 'Pending',
    paidAt: null,
    createdAt: '2026-08-02T09:00:00+07:00',
  },
]

describe('PaymentHistoryTable', () => {
  it('opens the complete payment filters from the compact toolbar', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <PaymentHistoryTable
          payments={payments}
          plans={[]}
          totalCount={2}
          pageIndex={0}
          pageSize={10}
          filters={filters}
          isLoading={false}
          isError={false}
          invoiceActionState={null}
          onFiltersChange={vi.fn()}
          onFiltersSubmit={vi.fn()}
          onFiltersReset={vi.fn()}
          onPreviousPage={vi.fn()}
          onNextPage={vi.fn()}
          onRetry={vi.fn()}
          onDownloadInvoice={vi.fn()}
          onPrintInvoice={vi.fn()}
        />
      </TooltipProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))

    expect(screen.getByRole('heading', { name: 'Bộ lọc thanh toán' })).toBeInTheDocument()
    expect(screen.getByLabelText('Mã hóa đơn')).toBeInTheDocument()
  })

  it('provides accessible invoice actions and only enables them for completed payments', () => {
    render(
      <TooltipProvider>
        <PaymentHistoryTable
          payments={payments}
          plans={[]}
          totalCount={2}
          pageIndex={0}
          pageSize={10}
          filters={filters}
          isLoading={false}
          isError={false}
          invoiceActionState={null}
          onFiltersChange={vi.fn()}
          onFiltersSubmit={vi.fn()}
          onFiltersReset={vi.fn()}
          onPreviousPage={vi.fn()}
          onNextPage={vi.fn()}
          onRetry={vi.fn()}
          onDownloadInvoice={vi.fn()}
          onPrintInvoice={vi.fn()}
        />
      </TooltipProvider>
    )

    expect(screen.getAllByText('Pro')).toHaveLength(2)
    expect(screen.getAllByText('Không xác định')).toHaveLength(2)

    for (const action of screen.getAllByRole('button', {
      name: 'Tải hóa đơn INV-001',
    })) {
      expect(action).toBeEnabled()
    }
    for (const action of screen.getAllByRole('button', {
      name: 'Tải hóa đơn INV-002',
    })) {
      expect(action).toBeDisabled()
    }
    for (const action of screen.getAllByRole('button', {
      name: 'In hóa đơn INV-001',
    })) {
      expect(action).toBeEnabled()
    }
    for (const action of screen.getAllByRole('button', {
      name: 'In hóa đơn INV-002',
    })) {
      expect(action).toBeDisabled()
    }
  })
})
