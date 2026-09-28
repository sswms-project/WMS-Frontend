import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { NotificationItem } from '../../types/platform-services.types'
import { NotificationList } from './NotificationList'

const staffNotification: NotificationItem = {
  id: '11111111-1111-4111-8111-111111111111',
  type: 'StaffInvitationUpdate',
  title: 'Nhân sự đã chấp nhận lời mời',
  message: 'Nguyễn An đã tham gia tổ chức.',
  isRead: false,
  referenceType: 'Invitation',
  referenceId: '22222222-2222-4222-8222-222222222222',
  createdAt: '2026-09-28T10:00:00Z',
}

describe('NotificationList', () => {
  it('shows the label for staff invitation notifications', () => {
    render(
      <NotificationList
        items={[staffNotification]}
        isLoading={false}
        isFetching={false}
        isError={false}
        hasActiveFilters={false}
        pendingNotificationId={null}
        onMarkRead={vi.fn()}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText('Nhân sự')).toBeInTheDocument()
  })
})
