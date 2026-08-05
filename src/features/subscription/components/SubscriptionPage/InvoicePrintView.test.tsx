import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InvoicePrintView } from './InvoicePrintView'
import type { InvoiceCustomerSnapshot, InvoiceDataResponse } from '../../types/subscription.types'

const invoice: InvoiceDataResponse = {
  paymentId: 'payment-1',
  subscriptionId: 'subscription-1',
  planId: null,
  planName: null,
  invoiceNumber: 'INV-2026-001',
  amount: 200000,
  status: 'Completed',
  paidAt: '2026-08-01T10:00:00+07:00',
  createdAt: '2026-08-01T09:00:00+07:00',
  subscriptionStartDate: null,
  subscriptionEndDate: null,
}

const customer: InvoiceCustomerSnapshot = {
  displayName: 'Tenant Owner',
  email: 'owner@example.com',
}

describe('InvoicePrintView', () => {
  it('renders a payment receipt from historical invoice snapshots', () => {
    render(<InvoicePrintView invoice={invoice} customer={customer} />)

    expect(screen.getByText('Biên nhận thanh toán')).toBeInTheDocument()
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument()
    expect(screen.getByText('Tenant Owner')).toBeInTheDocument()
    expect(screen.getByText('owner@example.com')).toBeInTheDocument()
    expect(screen.getByText('Không xác định')).toBeInTheDocument()
    expect(screen.getAllByText('Không có dữ liệu lịch sử')).toHaveLength(2)
    expect(screen.getByText(/200\.000\s*₫/)).toBeInTheDocument()
    expect(screen.getByText(/không phải hóa đơn điện tử hợp pháp/i)).toBeInTheDocument()
  })
})
