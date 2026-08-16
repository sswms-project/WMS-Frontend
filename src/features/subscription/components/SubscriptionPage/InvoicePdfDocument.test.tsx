// @vitest-environment node

import { renderToBuffer } from '@react-pdf/renderer'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { InvoicePdfDocument } from './InvoicePdfDocument'
import type { InvoiceDataResponse } from '../../types/subscription.types'

const invoice: InvoiceDataResponse = {
  paymentId: 'payment-1',
  subscriptionId: 'subscription-1',
  planId: 'plan-1',
  planName: 'Gói Tiêu chuẩn',
  invoiceNumber: 'INV-2026-001',
  amount: 200000,
  status: 'Completed',
  paidAt: '2026-08-01T10:00:00+07:00',
  createdAt: '2026-08-01T09:00:00+07:00',
  subscriptionStartDate: '2026-08-01T10:00:00+07:00',
  subscriptionEndDate: '2026-09-01T10:00:00+07:00',
}

describe('InvoicePdfDocument', () => {
  it('renders Vietnamese customer data without replacement characters', async () => {
    const pdf = await renderToBuffer(
      <InvoicePdfDocument
        invoice={invoice}
        customer={{ displayName: 'Nguyễn Ánh', email: 'anh@example.com' }}
      />
    )

    const pdfBytes = new Uint8Array(pdf.buffer, pdf.byteOffset, pdf.byteLength)
    const document = await getDocument({ data: pdfBytes }).promise
    const page = await document.getPage(1)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .filter((item) => 'str' in item)
      .map((item) => item.str)
      .join('')

    expect(text).toContain('Nguyễn Ánh')
    expect(text).not.toContain('?')
  }, 15_000)
})
