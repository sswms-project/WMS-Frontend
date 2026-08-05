import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InvoicePrintPage } from './InvoicePrintPage'
import type { InvoiceDataResponse } from '../types/subscription.types'

const invoice: InvoiceDataResponse = {
  paymentId: 'payment-1',
  subscriptionId: 'subscription-1',
  planId: 'plan-1',
  planName: 'Professional',
  invoiceNumber: 'INV-2026-001',
  amount: 200000,
  status: 'Completed',
  paidAt: '2026-08-01T10:00:00+07:00',
  createdAt: '2026-08-01T09:00:00+07:00',
  subscriptionStartDate: '2026-08-01T10:00:00+07:00',
  subscriptionEndDate: '2026-09-01T10:00:00+07:00',
}

const useInvoiceDataQuery = vi.fn()

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { fullName: string; email: string } }) => unknown) =>
    selector({ user: { fullName: 'Tenant Owner', email: 'owner@example.com' } }),
}))

vi.mock('../components/SubscriptionPage', () => ({
  InvoicePrintView: ({ invoice: currentInvoice }: { invoice: InvoiceDataResponse }) => (
    <div>Receipt {currentInvoice.paymentId}</div>
  ),
}))

vi.mock('../hooks/use-subscription', () => ({
  useInvoiceDataQuery: (...args: unknown[]) => useInvoiceDataQuery(...args),
}))

describe('InvoicePrintPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('print', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches its own completed invoice and prints only after rendering it', () => {
    useInvoiceDataQuery.mockReturnValue({
      data: invoice,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    render(<InvoicePrintPage paymentId="payment-1" />)

    expect(useInvoiceDataQuery).toHaveBeenCalledWith('payment-1', true)
    expect(screen.getByText('Receipt payment-1')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(250))

    expect(window.print).toHaveBeenCalledOnce()
  })

  it('rejects non-completed invoice data without rendering or printing a receipt', () => {
    useInvoiceDataQuery.mockReturnValue({
      data: { ...invoice, status: 'Pending' },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    render(<InvoicePrintPage paymentId="payment-1" />)

    expect(screen.getByText('Payment receipt unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Receipt payment-1')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(250))

    expect(window.print).not.toHaveBeenCalled()
  })
})
