import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import type { UserRole } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import { AppSidebar } from './AppSidebar'

const mocks = vi.hoisted(() => ({
  pathname: '/products',
  defaultPermissions: [
    'dashboard:view',
    'organization:view',
    'staff:view',
    'tenant-role-permissions:view',
    'warehouses:view',
    'products:view',
    'suppliers:view',
    'purchase-orders:view',
    'inbound-receipts:view',
    'inventory:view',
    'subscriptions:view',
    'subscription-plans:view',
  ],
  permissions: Array<string>(),
  queryState: 'success',
  queryError: new Error('Unable to load permissions'),
  refetch: vi.fn(),
  loggerError: vi.fn(),
  toastError: vi.fn(),
  isMobile: false,
}))

vi.mock('sonner', () => ({
  toast: { error: mocks.toastError },
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: mocks.loggerError },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}))

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useMeQuery: () => ({
    data: mocks.queryState === 'success' ? { permissions: mocks.permissions } : undefined,
    error: mocks.queryState === 'error' ? mocks.queryError : null,
    isPending: mocks.queryState === 'pending',
    isError: mocks.queryState === 'error',
    isSuccess: mocks.queryState === 'success',
    refetch: mocks.refetch,
  }),
}))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mocks.isMobile,
}))

function SidebarTestTree() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </TooltipProvider>
  )
}

function renderSidebar() {
  return render(<SidebarTestTree />)
}

function setCurrentUser(role: UserRole) {
  useAuthStore.setState({
    user: {
      id: 'user-1',
      tenantId: 'tenant-1',
      fullName: 'Current User',
      email: 'current.user@sswms.local',
      role,
      isActive: true,
    },
  })
}

describe('AppSidebar tenant navigation', () => {
  beforeEach(() => {
    mocks.pathname = '/products'
    mocks.queryState = 'success'
    mocks.isMobile = false
    mocks.permissions = [...mocks.defaultPermissions]
    mocks.refetch.mockReset()
    mocks.loggerError.mockReset()
    mocks.toastError.mockReset()
    setCurrentUser(USER_ROLES.TenantOwner)
  })

  it('keeps inactive groups closed and opens only the group containing the active route', () => {
    renderSidebar()

    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quản trị tổ chức' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByRole('button', { name: 'Danh mục' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Danh mục' })).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('link', { name: 'Sản phẩm' })).toHaveAttribute('aria-current', 'page')
  })

  it('supports keyboard-accessible group collapse without removing the group trigger', async () => {
    const user = userEvent.setup()
    renderSidebar()
    const catalogTrigger = screen.getByRole('button', { name: 'Danh mục' })

    catalogTrigger.focus()
    await user.keyboard('{Enter}')

    expect(catalogTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Sản phẩm' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Danh mục' })).toHaveFocus()
  })

  it('opens the newly active group after a route change', async () => {
    const user = userEvent.setup()
    const { rerender } = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Danh mục' }))
    expect(screen.getByRole('button', { name: 'Danh mục' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )

    mocks.pathname = '/inventory'
    rerender(<SidebarTestTree />)

    expect(screen.getByRole('button', { name: 'Danh mục' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByRole('button', { name: 'Vận hành kho' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('link', { name: 'Tồn kho' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders unfinished destinations as disabled controls with a usable tooltip', async () => {
    const user = userEvent.setup()
    renderSidebar()
    await user.click(screen.getByRole('button', { name: 'Vận hành kho' }))

    const transferItem = screen.getByRole('button', {
      name: 'Điều chuyển kho - Chức năng đang phát triển',
    })

    expect(transferItem).toBeDisabled()
    expect(transferItem).not.toHaveAttribute('title')
    expect(screen.queryByRole('link', { name: 'Điều chuyển kho' })).not.toBeInTheDocument()

    const tooltipTrigger = transferItem.parentElement
    if (!(tooltipTrigger instanceof HTMLElement)) {
      throw new Error('Expected the planned navigation item to have a tooltip trigger')
    }

    await user.hover(tooltipTrigger)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Chức năng đang phát triển')
  })

  it('shows a stable loading state until navigation permissions are ready', () => {
    mocks.queryState = 'pending'

    renderSidebar()

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải điều hướng…')
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByText('Báo cáo')).not.toBeInTheDocument()
  })

  it('reports permission loading errors and lets the user retry', async () => {
    const user = userEvent.setup()
    mocks.queryState = 'error'

    renderSidebar()

    expect(screen.getByRole('alert')).toHaveTextContent('Không thể tải quyền điều hướng.')
    expect(mocks.loggerError).toHaveBeenCalledWith(mocks.queryError)
    expect(mocks.toastError).toHaveBeenCalledWith(
      'Không thể tải quyền điều hướng. Vui lòng thử lại.'
    )

    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(mocks.refetch).toHaveBeenCalledOnce()
  })

  it('keeps the tenant-only visual treatment away from other roles', () => {
    mocks.pathname = '/dashboard'
    mocks.permissions = ['admin:dashboard:view']
    setCurrentUser(USER_ROLES.SystemAdmin)

    renderSidebar()

    const dashboardMenuButton = screen
      .getByRole('link', { name: 'Dashboard' })
      .closest('[data-sidebar="menu-button"]')
    const brandName = screen.getByText('KOVIA')

    expect(dashboardMenuButton).not.toHaveClass('data-[active=true]:bg-sidebar-primary')
    expect(brandName).toHaveClass('text-sm')
    expect(brandName).not.toHaveClass('text-xl')
  })
})
