import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { InboundDocumentImport } from '../../../types/inbound.types'
import { ImportState } from './ImportState'

function importResult(status: InboundDocumentImport['status']): InboundDocumentImport {
  return {
    id: '10000000-0000-4000-8000-000000000001',
    fileName: 'delivery.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
    status,
    schemaVersion: '1.0',
    failureCode: status === 'Failed' ? 'ProviderQuotaExceeded' : null,
    failureMessage: status === 'Failed' ? 'Hạn mức phân tích tạm thời không khả dụng.' : null,
    extractionProvider: 'Gemini',
    extractionModel: 'gemini-3.6-flash',
    createdAt: '2026-09-04T00:00:00Z',
    reviewedAt: null,
    inboundReceiptId: null,
    duplicateFileDetected: false,
    review: null,
  }
}

describe('ImportState', () => {
  it('shows a non-blocking processing state', () => {
    render(
      <ImportState
        importData={importResult('Processing')}
        draftReceiptId={null}
        isLoading={false}
        onManualFallback={vi.fn()}
      />
    )

    expect(screen.getByText('Đang phân tích chứng từ…')).toBeInTheDocument()
  })

  it('offers manual receiving when extraction fails', async () => {
    const user = userEvent.setup()
    const onManualFallback = vi.fn()
    render(
      <ImportState
        importData={importResult('Failed')}
        draftReceiptId={null}
        isLoading={false}
        onManualFallback={onManualFallback}
      />
    )

    expect(screen.getByText('Hạn mức phân tích tạm thời không khả dụng.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tiếp tục nhập thủ công' }))
    expect(onManualFallback).toHaveBeenCalledOnce()
  })

  it('routes the user to the Draft receipt after conversion', () => {
    render(
      <ImportState
        importData={importResult('DraftReceiptCreated')}
        draftReceiptId="20000000-0000-4000-8000-000000000001"
        isLoading={false}
        onManualFallback={vi.fn()}
      />
    )

    expect(screen.getByRole('link', { name: 'Xem phiếu nhập nháp' })).toHaveAttribute(
      'href',
      '/inbound/receipts/20000000-0000-4000-8000-000000000001'
    )
    expect(screen.getByText(/cần được gửi và phê duyệt/)).toBeInTheDocument()
  })
})
