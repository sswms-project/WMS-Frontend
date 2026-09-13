import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  subjectsQuery: {
    data: undefined as
      | {
          items: Array<{
            userId: string
            fullName: string
            email: string
            roleId: string
            roleName: string
            assignedWarehouseCount: number
            customizedPermissionCount: number
          }>
          totalCount: number
        }
      | undefined,
    isFetching: false,
    error: null as { statusCode: number; message: string } | null,
    refetch: vi.fn(),
  },
  personalQuery: {
    data: undefined as
      | {
          subject: {
            userId: string
            fullName: string
            email: string
            roleId: string
            roleName: string
            warehouses: Array<{ id: string; code: string; name: string }>
          }
          roleDefaultPermissionIds: string[]
          grantedOverridePermissionIds: string[]
          deniedOverridePermissionIds: string[]
          effectivePermissionIds: string[]
          customizedPermissionIds: string[]
        }
      | undefined,
    isLoading: false,
    error: null as { statusCode: number; message: string } | null,
    refetch: vi.fn(),
  },
  userMutation: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  resetMutation: {
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
  usePermissionSubjectsQuery: () => testState.subjectsQuery,
  useTenantUserPermissionsQuery: () => testState.personalQuery,
  useUpdateTenantUserPermissionsMutation: () => testState.userMutation,
  useResetTenantUserPermissionsMutation: () => testState.resetMutation,
}))

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value,
}))

const VIEW_PERMISSION_ID = 'a73b60fa-0e18-49bc-936c-bc568b72b486'
const CONFIGURE_PERMISSION_ID = 'c0391037-32dc-4dd8-bc61-7cc04777dcff'
const MANAGER_ROLE_ID = '4b335696-d99a-8fd8-864d-f86a32be1781'
const STAFF_ROLE_ID = '1a13e448-0388-da07-2782-cf395c564951'
const SUBJECT_ID = '79e8c85b-7786-44d5-b507-bb44e722adcb'

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

const subject = {
  userId: SUBJECT_ID,
  fullName: 'Nguyễn Văn An',
  email: 'an@sswms.local',
  roleId: MANAGER_ROLE_ID,
  roleName: USER_ROLES.WarehouseManager,
  assignedWarehouseCount: 1,
  customizedPermissionCount: 1,
}

const personalWorkspace = {
  subject: {
    userId: SUBJECT_ID,
    fullName: 'Nguyễn Văn An',
    email: 'an@sswms.local',
    roleId: MANAGER_ROLE_ID,
    roleName: USER_ROLES.WarehouseManager,
    warehouses: [
      {
        id: '60416824-899a-409c-9556-c060d684f59b',
        code: 'FPT-01',
        name: 'Kho Kovia',
      },
    ],
  },
  roleDefaultPermissionIds: [VIEW_PERMISSION_ID],
  grantedOverridePermissionIds: [],
  deniedOverridePermissionIds: [VIEW_PERMISSION_ID],
  effectivePermissionIds: [],
  customizedPermissionIds: [VIEW_PERMISSION_ID],
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
    testState.subjectsQuery.data = { items: [subject], totalCount: 1 }
    testState.subjectsQuery.isFetching = false
    testState.subjectsQuery.error = null
    testState.subjectsQuery.refetch.mockReset()
    testState.personalQuery.data = personalWorkspace
    testState.personalQuery.isLoading = false
    testState.personalQuery.error = null
    testState.personalQuery.refetch
      .mockReset()
      .mockResolvedValue({ isSuccess: true, data: personalWorkspace })
    testState.userMutation.isPending = false
    testState.userMutation.mutateAsync.mockReset().mockResolvedValue({ isSuccess: true })
    testState.resetMutation.isPending = false
    testState.resetMutation.mutateAsync.mockReset().mockResolvedValue({ isSuccess: true })
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

  it('switches role tabs without allowing vertical overflow in the tab strip', async () => {
    const user = userEvent.setup()
    renderPage()

    const roleNavigation = screen.getByRole('navigation', {
      name: 'Vai trò có thể phân quyền',
    })
    const managerTab = within(roleNavigation).getByRole('tab', { name: /Quản lý kho/ })
    const staffTab = within(roleNavigation).getByRole('tab', { name: /Nhân viên kho/ })
    const roleTabList = within(roleNavigation).getByRole('tablist')

    expect(roleNavigation).toHaveClass('overflow-y-hidden')
    expect(roleTabList).toHaveClass('h-12')
    expect(managerTab).toHaveClass('h-full')
    expect(managerTab).toHaveClass('ring-inset')
    expect(managerTab).toHaveAttribute('aria-selected', 'true')

    await user.click(staffTab)

    expect(staffTab).toHaveAttribute('aria-selected', 'true')
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

  it('shows a specific backend policy message instead of masking every forbidden response', async () => {
    testState.mutation.mutateAsync.mockRejectedValue({
      statusCode: 403,
      message: "Permission 'forecasting:create-po' cannot be assigned to Warehouse Manager.",
    })
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)

    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(
      await screen.findByText(
        "Permission 'forecasting:create-po' cannot be assigned to Warehouse Manager."
      )
    ).toBeInTheDocument()
  })

  it('prompts before switching roles with an unsaved draft', async () => {
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))

    const roleNavigation = screen.getByRole('navigation', {
      name: 'Vai trò có thể phân quyền',
    })
    const staffTab = within(roleNavigation).getByRole('tab', { name: /Nhân viên kho/ })
    await user.click(staffTab)

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Bạn có thay đổi chưa lưu')
    await user.click(within(dialog).getByRole('button', { name: 'Bỏ thay đổi' }))
    expect(staffTab).toHaveAttribute('aria-selected', 'true')
  })

  it('hides backend permission keys from tenant users', async () => {
    const user = userEvent.setup()
    renderPage()

    await openWarehouseModule(user)

    expect(screen.queryByText('warehouses:view')).not.toBeInTheDocument()
    expect(screen.getByText('Xem danh sách và thông tin kho.')).toBeInTheDocument()
  })

  it('prompts before leaving the role editor for personal permissions with an unsaved draft', async () => {
    const user = userEvent.setup()
    renderPage()
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' }))

    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Bạn có thay đổi chưa lưu')
    await user.click(within(dialog).getByRole('button', { name: 'Bỏ thay đổi' }))
    expect(screen.getByText('Chọn nhân sự để cấu hình')).toBeInTheDocument()
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

  it('opens personal permissions without selecting an employee automatically', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))

    expect(screen.getByText('Chọn nhân sự để cấu hình')).toBeInTheDocument()
    expect(screen.getByLabelText('Nhân sự cần phân quyền')).toBeInTheDocument()
    expect(screen.queryByText('Nguyễn Văn An')).not.toBeInTheDocument()
  })

  it('selects an employee and saves the complete effective permission set', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))

    const subjectInput = screen.getByLabelText('Nhân sự cần phân quyền')
    await user.click(subjectInput)
    await user.click(await screen.findByText('Nguyễn Văn An'))

    expect(screen.getByText('FPT-01 · Kho Kovia')).toBeInTheDocument()
    await openWarehouseModule(user)
    const viewPermission = screen.getByRole('checkbox', { name: 'Xem kho hàng' })
    expect(viewPermission).not.toBeChecked()
    expect(screen.getByText('Tùy chỉnh')).toBeInTheDocument()

    await user.click(viewPermission)
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() =>
      expect(testState.userMutation.mutateAsync).toHaveBeenCalledWith({
        userId: SUBJECT_ID,
        body: {
          expectedRoleId: MANAGER_ROLE_ID,
          permissionIds: [VIEW_PERMISSION_ID],
        },
      })
    )
  })

  it('confirms reset and sends only the expected role id', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))
    await user.click(screen.getByLabelText('Nhân sự cần phân quyền'))
    await user.click(await screen.findByText('Nguyễn Văn An'))

    await user.click(screen.getByRole('button', { name: 'Khôi phục quyền mặc định' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Mọi tùy chỉnh cá nhân sẽ bị xóa')
    await user.click(within(dialog).getByRole('button', { name: 'Khôi phục' }))

    await waitFor(() =>
      expect(testState.resetMutation.mutateAsync).toHaveBeenCalledWith({
        userId: SUBJECT_ID,
        body: { expectedRoleId: MANAGER_ROLE_ID },
      })
    )
  })

  it('blocks stale saves and reloads the personal workspace after a concurrency conflict', async () => {
    testState.userMutation.mutateAsync.mockRejectedValue({
      statusCode: 409,
      message: 'Conflict',
      errors: { code: ['USER_PERMISSION_STATE_CONFLICT'] },
    })
    const refreshedWorkspace = {
      ...personalWorkspace,
      effectivePermissionIds: [VIEW_PERMISSION_ID],
      deniedOverridePermissionIds: [],
      customizedPermissionIds: [],
    }
    testState.personalQuery.refetch.mockResolvedValue({
      isSuccess: true,
      data: refreshedWorkspace,
    })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))
    await user.click(screen.getByLabelText('Nhân sự cần phân quyền'))
    await user.click(await screen.findByText('Nguyễn Văn An'))
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Xem kho hàng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText(/vừa được cập nhật ở nơi khác/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi và tải lại' }))

    expect(testState.personalQuery.refetch).toHaveBeenCalledOnce()
    expect(screen.queryByText(/vừa được cập nhật ở nơi khác/)).not.toBeInTheDocument()
  })

  it('requires reselecting the employee after their role changes', async () => {
    testState.userMutation.mutateAsync.mockRejectedValue({
      statusCode: 409,
      message: 'Role changed',
      errors: { code: ['USER_ROLE_CHANGED'] },
    })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))
    await user.click(screen.getByLabelText('Nhân sự cần phân quyền'))
    await user.click(await screen.findByText('Nguyễn Văn An'))
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Xem kho hàng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText(/Vai trò của nhân sự đã thay đổi/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Chọn lại nhân sự' }))

    expect(screen.getByText('Chọn nhân sự để cấu hình')).toBeInTheDocument()
    expect(screen.queryByText(/Vai trò của nhân sự đã thay đổi/)).not.toBeInTheDocument()
  })

  it('clears an unavailable employee after the backend rejects a save', async () => {
    testState.userMutation.mutateAsync.mockRejectedValue({
      statusCode: 409,
      message: 'Inactive',
      errors: { code: ['USER_NOT_ACTIVE'] },
    })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))
    await user.click(screen.getByLabelText('Nhân sự cần phân quyền'))
    await user.click(await screen.findByText('Nguyễn Văn An'))
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Xem kho hàng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText('Chọn nhân sự để cấu hình')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu thay đổi' })).not.toBeInTheDocument()
  })

  it('surfaces a dirty background refresh and reloads only after explicit confirmation', async () => {
    const refreshedWorkspace = {
      ...personalWorkspace,
      effectivePermissionIds: [CONFIGURE_PERMISSION_ID],
      grantedOverridePermissionIds: [],
      deniedOverridePermissionIds: [VIEW_PERMISSION_ID],
      customizedPermissionIds: [CONFIGURE_PERMISSION_ID, VIEW_PERMISSION_ID],
    }
    testState.personalQuery.refetch.mockResolvedValue({
      isSuccess: true,
      data: refreshedWorkspace,
    })
    const user = userEvent.setup()
    const view = renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))
    await user.click(screen.getByLabelText('Nhân sự cần phân quyền'))
    await user.click(await screen.findByText('Nguyễn Văn An'))
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Xem kho hàng' }))

    testState.personalQuery.data = refreshedWorkspace
    view.rerender(
      <TooltipProvider>
        <TenantAccessControlPage />
      </TooltipProvider>
    )

    expect(await screen.findByText(/Dữ liệu quyền trên máy chủ đã thay đổi/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi và tải lại' }))

    expect(screen.getByRole('checkbox', { name: 'Xem kho hàng' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Cấu hình bố cục' })).toBeChecked()
  })

  it('does not flash a stale-data warning when the current save refetches its own result', async () => {
    let resolveSave!: () => void
    const pendingSave = new Promise<{ isSuccess: boolean }>((resolve) => {
      resolveSave = () => resolve({ isSuccess: true })
    })
    testState.userMutation.mutateAsync.mockImplementation(() => {
      testState.userMutation.isPending = true
      return pendingSave
    })
    const user = userEvent.setup()
    const view = renderPage()
    await user.click(screen.getByRole('tab', { name: 'Quyền cá nhân' }))
    await user.click(screen.getByLabelText('Nhân sự cần phân quyền'))
    await user.click(await screen.findByText('Nguyễn Văn An'))
    await openWarehouseModule(user)
    await user.click(screen.getByRole('checkbox', { name: 'Xem kho hàng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    testState.personalQuery.data = {
      ...personalWorkspace,
      deniedOverridePermissionIds: [],
      effectivePermissionIds: [VIEW_PERMISSION_ID],
      customizedPermissionIds: [],
    }
    view.rerender(
      <TooltipProvider>
        <TenantAccessControlPage />
      </TooltipProvider>
    )

    expect(screen.queryByText(/Dữ liệu quyền trên máy chủ đã thay đổi/)).not.toBeInTheDocument()

    await act(async () => {
      testState.userMutation.isPending = false
      resolveSave()
      await pendingSave
    })
    view.rerender(
      <TooltipProvider>
        <TenantAccessControlPage />
      </TooltipProvider>
    )
    expect(screen.queryByText(/Dữ liệu quyền trên máy chủ đã thay đổi/)).not.toBeInTheDocument()
  })
})
