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
  it('uses the provided Vietnamese labels and falls back to the raw action', () => {
    render(
      <LifecycleTimeline
        events={[event({ action: 'Approve' }), event({ action: 'SomethingNew' })]}
        actionLabels={{ Approve: 'Phê duyệt' }}
      />
    )

    expect(screen.getByText('Phê duyệt')).toBeInTheDocument()
    expect(screen.getByText('SomethingNew')).toBeInTheDocument()
  })

  it('labels the detail per action and defaults to "Lý do"', () => {
    render(
      <LifecycleTimeline
        events={[
          event({ action: 'SendToSupplier', reason: 'a@ncc.vn' }),
          event({ action: 'Reject', reason: 'Sai số lượng' }),
        ]}
        reasonLabels={{ SendToSupplier: 'Người nhận' }}
      />
    )

    expect(screen.getByText('Người nhận: a@ncc.vn')).toBeInTheDocument()
    expect(screen.getByText('Lý do: Sai số lượng')).toBeInTheDocument()
  })
})
