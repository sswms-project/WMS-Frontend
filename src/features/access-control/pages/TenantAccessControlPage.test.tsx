import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import type { TenantRolePermissionWorkspace } from '../types/tenant-access-control.types'
import TenantAccessControlPage from './TenantAccessControlPage'

const testState = vi.hoisted(() => ({
  push: vi.fn(),
  query: {
    data: undefined as TenantRolePermissionWorkspace | undefined,
    isLoading: false,
    isError: false,
    error: null as { statusCode: number; message: string } | null,
    refetch: vi.fn(),
  },
  mutation: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/settings/access-control',
  useRouter: () => ({ push: testState.push }),
}))

vi.mock('../hooks/use-tenant-access-control', () => ({
  useTenantAccessControlQuery: () => testState.query,
  useUpdateTenantRolePermissionsMutation: () => testState.mutation,
}))

const VIEW_PERMISSION_ID = 'a73b60fa-0e18-49bc-936c-bc568b72b486'
const CONFIGURE_PERMISSION_ID = 'c0391037-32dc-4dd8-bc61-7cc04777dcff'
const MANAGER_ROLE_ID = '51b3dc62-d48a-422c-bdcf-a5e6e3ec1498'
const STAFF_ROLE_ID = '27a7feb6-a872-45d1-912a-4bda53557c81'

const workspace: TenantRolePermissionWorkspace = {
  roles: [
    {
      roleId: MANAGER_ROLE_ID,
      roleName: USER_ROLES.WarehouseManager,
      directPermissionIds: [CONFIGURE_PERMISSION_ID],
      inheritedPermissionIds: [VIEW_PERMISSION_ID],
      effectivePermissionIds: [CONFIGURE_PERMISSION_ID, VIEW_PERMISSION_ID],
    },
    {
      roleId: STAFF_ROLE_ID,
      roleName: USER_ROLES.WarehouseStaff,
      directPermissionIds: [VIEW_PERMISSION_ID],
      inheritedPermissionIds: [],
      effectivePermissionIds: [VIEW_PERMISSION_ID],
    },
  ],
  permissions: [
    {
      id: VIEW_PERMISSION_ID,
      permissionKey: 'warehouses:view',
      module: 'warehouses',
      moduleDisplayName: 'Kho hàng',
      displayName: 'Xem kho hàng',
      description: 'Xem danh sách và thông tin kho.',
      eligibleRoles: [USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff],
    },
    {
      id: CONFIGURE_PERMISSION_ID,
      permissionKey: 'warehouses:configure-layout',
      module: 'warehouses',
      moduleDisplayName: 'Kho hàng',
      displayName: 'Cấu hình bố cục',
      description: 'Tạo và chỉnh sửa cấu trúc kho.',
      eligibleRoles: [USER_ROLES.WarehouseManager],
    },
  ],
}

function renderPage() {
  return render(
    <TooltipProvider>
      <TenantAccessControlPage />
    </TooltipProvider>
  )
}

async function openWarehouseModule(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Kho hàng/ }))
}

describe('TenantAccessControlPage', () => {
  beforeEach(() => {
    testState.query.data = workspace
    testState.query.isLoading = false
    testState.query.isError = false
    testState.query.error = null
    testState.query.refetch.mockReset()
    testState.mutation.isPending = false
    testState.mutation.mutateAsync.mockReset().mockResolvedValue({ isSuccess: true })
    testState.push.mockReset()
  })

  it('renders inherited manager permissions checked and locked', async () => {
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)

    const inheritedCheckbox = screen.getByRole('checkbox', { name: 'Xem kho hàng' })
    expect(inheritedCheckbox).toBeChecked()
    expect(inheritedCheckbox).toBeDisabled()
    expect(screen.getByText('Kế thừa từ Nhân viên kho')).toBeInTheDocument()
  })

  it('renders forbidden and empty workspace states distinctly', () => {
    testState.query.data = undefined
    testState.query.isError = true
    testState.query.error = { statusCode: 403, message: 'Forbidden' }
    const { rerender } = renderPage()

    expect(screen.getByText('Bạn không có quyền truy cập')).toBeInTheDocument()

    testState.query.isError = false
    testState.query.error = null
    testState.query.data = { roles: [], permissions: [] }
    rerender(
      <TooltipProvider>
        <TenantAccessControlPage />
      </TooltipProvider>
    )
    expect(screen.getByText('Chưa có vai trò để cấu hình')).toBeInTheDocument()
  })

  it('submits only the edited direct permission ids', async () => {
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)

    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() =>
      expect(testState.mutation.mutateAsync).toHaveBeenCalledWith({
        roleId: MANAGER_ROLE_ID,
        body: { permissionIds: [] },
      })
    )
  })

  it('keeps save disabled while clean and restores the draft when discarded', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled()
    await openWarehouseModule(user)

    const directCheckbox = screen.getByRole('checkbox', { name: 'Cấu hình bố cục' })
    await user.click(directCheckbox)

    expect(screen.getByText('Chưa lưu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi' }))

    expect(directCheckbox).toBeChecked()
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled()
    expect(screen.queryByText('Chưa lưu')).not.toBeInTheDocument()
  })

  it('keeps the draft and shows an inline error when save fails', async () => {
    testState.mutation.mutateAsync.mockRejectedValue({
      statusCode: 403,
      message: 'Forbidden',
    })
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)

    const directCheckbox = screen.getByRole('checkbox', { name: 'Cấu hình bố cục' })
    await user.click(directCheckbox)
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText(/Quyền thao tác của bạn đã thay đổi/)).toBeInTheDocument()
    expect(directCheckbox).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeInTheDocument()
  })

  it('prompts before switching roles with an unsaved draft', async () => {
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))

    const roleNavigation = screen.getByRole('navigation', {
      name: 'Vai trò có thể phân quyền',
    })
    await user.click(within(roleNavigation).getByRole('button', { name: /Nhân viên kho/ }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Bạn có thay đổi chưa lưu')
    await user.click(within(dialog).getByRole('button', { name: 'Bỏ thay đổi' }))
    expect(screen.getByRole('heading', { name: 'Nhân viên kho' })).toBeInTheDocument()
  })

  it('registers browser unload protection only while dirty', async () => {
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)
    const cleanEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(cleanEvent)
    expect(cleanEvent.defaultPrevented).toBe(false)

    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))
    const dirtyEvent = new Event('beforeunload', { cancelable: true })
    fireEvent(window, dirtyEvent)
    expect(dirtyEvent.defaultPrevented).toBe(true)
  })

  it('prompts before browser history navigation and continues after discard', async () => {
    const historyForward = vi.spyOn(window.history, 'forward').mockImplementation(() => undefined)
    const historyBack = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))

    fireEvent.popState(window)

    expect(historyForward).toHaveBeenCalledOnce()
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Bạn có thay đổi chưa lưu')

    await user.click(within(dialog).getByRole('button', { name: 'Bỏ thay đổi' }))
    expect(historyBack).toHaveBeenCalledOnce()

    historyForward.mockRestore()
    historyBack.mockRestore()
  })
})
