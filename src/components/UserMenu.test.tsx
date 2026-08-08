import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import type { AuthUser } from '@/features/auth'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { UserMenu } from './UserMenu'

interface MutationCallbacks {
  onSettled?: () => void
}

const mocks = vi.hoisted(() => ({
  isPending: false,
  mutate: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

vi.mock('@/features/auth', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/features/auth')>()

  return {
    ...original,
    useLogoutMutation: () => ({
      isPending: mocks.isPending,
      mutate: mocks.mutate,
    }),
  }
})

const currentUser: AuthUser = {
  id: 'user-1',
  tenantId: 'tenant-1',
  fullName: 'Vũ Hoàng',
  email: 'vu.hoang@example.com',
  role: USER_ROLES.TenantOwner,
  isActive: true,
}

function renderUserMenu(queryClient: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return render(<UserMenu />, { wrapper: Wrapper })
}

describe('UserMenu', () => {
  beforeEach(() => {
    mocks.isPending = false
    mocks.mutate.mockReset()
    mocks.replace.mockReset()
    localStorage.clear()
    localStorage.setItem('access_token', 'access-token')
    localStorage.setItem('refresh_token', 'refresh-token')
    useAuthStore.setState({ user: currentUser })
  })

  it('clears local session and private cache after logout settles', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()
    queryClient.setQueryData(['private-data'], { id: 'private' })
    mocks.mutate.mockImplementation((_variables: undefined, callbacks: MutationCallbacks) => {
      callbacks.onSettled?.()
    })

    renderUserMenu(queryClient)
    await user.click(screen.getByRole('button', { name: /Mở menu tài khoản/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }))

    expect(mocks.mutate).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(queryClient.getQueryData(['private-data'])).toBeUndefined()
    expect(mocks.replace).toHaveBeenCalledWith(APP_ROUTES.auth.login)
  })

  it('keeps the logout action disabled while the request is pending', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()
    mocks.isPending = true

    renderUserMenu(queryClient)
    await user.click(screen.getByRole('button', { name: /Mở menu tài khoản/ }))

    expect(screen.getByRole('menuitem', { name: 'Đang đăng xuất...' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
