import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { LifecycleEvent } from '@/features/inbound-request/types/inbound-request.types'
import { LifecycleTimeline } from './LifecycleTimeline'

function event(overrides: Partial<LifecycleEvent>): LifecycleEvent {
  return {
    action: 'Create',
    fromState: null,
    toState: null,
    actorId: 'user-1',
    actorName: 'Tenant Owner',
    reason: null,
    createdAt: '2026-09-30T15:59:00Z',
    ...overrides,
  }
}

describe('LifecycleTimeline', () => {
  it('shows Vietnamese labels for known actions and falls back to the raw action', () => {
    render(
      <LifecycleTimeline
        events={[event({ action: 'Approve' }), event({ action: 'SomethingNew' })]}
      />
    )

    expect(screen.getByText('Phê duyệt')).toBeInTheDocument()
    expect(screen.getByText('SomethingNew')).toBeInTheDocument()
  })

  it('labels the supplier mail recipient and strips the legacy "To=" prefix', () => {
    render(
      <LifecycleTimeline
        events={[
          event({ action: 'SendToSupplier', reason: 'a@ncc.vn' }),
          event({ action: 'ResendToSupplier', reason: 'To=b@ncc.vn' }),
        ]}
      />
    )

    expect(screen.getByText('Gửi mail cho nhà cung cấp')).toBeInTheDocument()
    expect(screen.getByText('Gửi lại mail cho nhà cung cấp')).toBeInTheDocument()
    expect(screen.getByText('Người nhận: a@ncc.vn')).toBeInTheDocument()
    expect(screen.getByText('Người nhận: b@ncc.vn')).toBeInTheDocument()
  })

  it('keeps "Lý do" for other actions', () => {
    render(<LifecycleTimeline events={[event({ action: 'Reject', reason: 'Sai số lượng' })]} />)

    expect(screen.getByText('Từ chối')).toBeInTheDocument()
    expect(screen.getByText('Lý do: Sai số lượng')).toBeInTheDocument()
  })
})
