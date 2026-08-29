import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { ProtectedRoute } from './ProtectedRoute'

const mocks = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mocks.replace.mockReset()
    localStorage.clear()
    localStorage.setItem('access_token', 'stale-access-token')
    localStorage.setItem('refresh_token', 'stale-refresh-token')
    useAuthStore.setState({ user: null })
  })

  it('clears stale session data before redirecting an unauthenticated user', async () => {
    render(
      <ProtectedRoute>
        <div>Private content</div>
      </ProtectedRoute>
    )

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.auth.login))
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})
