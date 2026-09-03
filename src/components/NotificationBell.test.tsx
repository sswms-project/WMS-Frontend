import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NotificationBell } from './NotificationBell'

describe('NotificationBell', () => {
  it('shows the loading and error states with a retry action', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        isLoading
        isError={false}
        pendingNotificationId={null}
        isMarkingAll={false}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onRetry={onRetry}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Thông báo' }))
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải thông báo…')

    rerender(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        isLoading={false}
        isError
        pendingNotificationId={null}
        isMarkingAll={false}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onRetry={onRetry}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
