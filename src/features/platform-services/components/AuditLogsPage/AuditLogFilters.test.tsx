import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuditLogFilters } from './AuditLogFilters'

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
)

describe('AuditLogFilters', () => {
  it('shows the selected custom date range in the shared calendar control', () => {
    render(
      <AuditLogFilters
        filters={{
          search: '',
          timeRange: 'custom',
          dateFrom: '2026-09-01',
          dateTo: '2026-09-15',
        }}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: '01/09/2026 - 15/09/2026' })).toBeInTheDocument()
  })
})
