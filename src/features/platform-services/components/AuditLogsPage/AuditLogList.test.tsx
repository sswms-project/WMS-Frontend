import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AuditLogItem } from '../../types/platform-services.types'
import { AuditLogList } from './AuditLogList'

const auditLog: AuditLogItem = {
  id: '11111111-1111-4111-8111-111111111111',
  tenantId: '22222222-2222-4222-8222-222222222222',
  warehouseId: null,
  warehouseCode: null,
  warehouseName: null,
  userId: '33333333-3333-4333-8333-333333333333',
  actorName: 'Nguyễn An',
  actorEmail: 'an@example.com',
  action: 'CreateInvitation',
  actionLabel: 'Gửi lời mời nhân sự',
  entityType: 'Invitation',
  entityTypeLabel: 'Lời mời nhân sự',
  entityId: '44444444-4444-4444-8444-444444444444',
  referenceDisplay: 'Trần Bình · binh@example.com',
  summary: 'Gửi lời mời nhân sự: Trần Bình · binh@example.com',
  description: 'CreateInvitation: None → Pending',
  reason: 'Role=WarehouseStaff',
  oldValue: 'None',
  newValue: 'Pending',
  changes: [],
  createdAt: '2026-09-27T10:00:00Z',
}

describe('AuditLogList', () => {
  it('shows Vietnamese presentation fields without exposing raw keys or IDs', () => {
    render(
      <AuditLogList
        items={[auditLog]}
        isLoading={false}
        isFetching={false}
        isError={false}
        hasActiveFilters={false}
        onView={vi.fn()}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getAllByText('Gửi lời mời nhân sự').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lời mời nhân sự').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Trần Bình').length).toBeGreaterThan(0)
    expect(screen.getAllByText('binh@example.com').length).toBeGreaterThan(0)
    expect(screen.queryByText('Trần Bình · binh@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText(auditLog.summary)).not.toBeInTheDocument()
    expect(screen.queryByText('CreateInvitation')).not.toBeInTheDocument()
    expect(screen.queryByText(auditLog.entityId)).not.toBeInTheDocument()
  })
})
