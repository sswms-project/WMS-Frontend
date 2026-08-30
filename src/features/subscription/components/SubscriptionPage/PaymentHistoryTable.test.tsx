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
  it('submits the current search text from the compact toolbar when pressing Enter', async () => {
    const user = userEvent.setup()
    const onFiltersSubmit = vi.fn()
    const onFiltersChange = vi.fn()

    render(
      <TooltipProvider>
        <PaymentHistoryTable
          payments={payments}
          plans={[]}
          totalCount={2}
          pageIndex={0}
          pageSize={10}
          filters={{ ...filters, searchText: 'INV-001' }}
          isLoading={false}
          isError={false}
          invoiceActionState={null}
          onFiltersChange={onFiltersChange}
          onFiltersSubmit={onFiltersSubmit}
          onFiltersReset={vi.fn()}
          onPreviousPage={vi.fn()}
          onNextPage={vi.fn()}
          onRetry={vi.fn()}
          onDownloadInvoice={vi.fn()}
          onPrintInvoice={vi.fn()}
        />
      </TooltipProvider>
    )

    await user.type(screen.getByLabelText('Tìm theo mã hóa đơn'), '{Enter}')

    expect(onFiltersSubmit).toHaveBeenCalledOnce()
    // jsdom submits a lone-text-field form on Enter even without a submit button, so the
    // assertion above alone would still pass if the button below regressed back to
    // type="button" — assert the markup directly so that regression is caught too.
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toHaveAttribute('type', 'submit')
  })

  it('submits the compact toolbar search when clicking the search button', async () => {
    const user = userEvent.setup()
    const onFiltersSubmit = vi.fn()

    render(
      <TooltipProvider>
        <PaymentHistoryTable
          payments={payments}
          plans={[]}
          totalCount={2}
          pageIndex={0}
          pageSize={10}
          filters={{ ...filters, searchText: 'INV-001' }}
          isLoading={false}
          isError={false}
          invoiceActionState={null}
          onFiltersChange={vi.fn()}
          onFiltersSubmit={onFiltersSubmit}
          onFiltersReset={vi.fn()}
          onPreviousPage={vi.fn()}
          onNextPage={vi.fn()}
          onRetry={vi.fn()}
          onDownloadInvoice={vi.fn()}
          onPrintInvoice={vi.fn()}
        />
      </TooltipProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(onFiltersSubmit).toHaveBeenCalledOnce()
  })

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
