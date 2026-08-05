import { render, screen } from '@testing-library/react'
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
  it('shows historical plans and only enables invoice actions for completed payments', () => {
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

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Không xác định')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'PDF' })[0]).toBeEnabled()
    expect(screen.getAllByRole('button', { name: 'PDF' })[1]).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'In' })[0]).toBeEnabled()
    expect(screen.getAllByRole('button', { name: 'In' })[1]).toBeDisabled()
  })
})
