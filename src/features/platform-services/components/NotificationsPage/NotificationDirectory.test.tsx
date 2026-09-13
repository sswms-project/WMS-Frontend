import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NotificationDirectory } from './NotificationDirectory'

const callbacks = {
  onApplyFilters: vi.fn(),
  onClearFilters: vi.fn(),
  onPageChange: vi.fn(),
  onMarkRead: vi.fn(),
  onMarkAllRead: vi.fn(),
  onRetry: vi.fn(),
}

const filters = {
  search: '',
  type: '',
  readState: 'all',
  dateFrom: '',
  dateTo: '',
}

describe('NotificationDirectory', () => {
  it('keeps mark-all enabled when unread notifications exist outside the current page', () => {
    render(
      <NotificationDirectory
        items={[]}
        totalCount={21}
        unreadCount={1}
        page={2}
        pageSize={20}
        filters={filters}
        isLoading={false}
        isFetching={false}
        isError={false}
        hasActiveFilters={false}
        pendingNotificationId={null}
        isMarkingAll={false}
        {...callbacks}
      />
    )

    expect(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' })).toBeEnabled()
  })

  it('disables mark-all only when the global unread count is zero', () => {
    render(
      <NotificationDirectory
        items={[]}
        totalCount={0}
        unreadCount={0}
        page={1}
        pageSize={20}
        filters={filters}
        isLoading={false}
        isFetching={false}
        isError={false}
        hasActiveFilters={false}
        pendingNotificationId={null}
        isMarkingAll={false}
        {...callbacks}
      />
    )

    expect(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' })).toBeDisabled()
  })
})
