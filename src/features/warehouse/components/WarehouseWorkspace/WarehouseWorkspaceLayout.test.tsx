import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import { useWarehouseLayoutEditorStore } from '@/stores/warehouse-layout-editor.store'
import type { WarehouseDetailResponse } from '@/types/warehouse'
import { WarehouseWorkspaceLayout } from './WarehouseWorkspaceLayout'

const warehouse: WarehouseDetailResponse = {
  id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
  warehouseCode: 'HCM-01',
  warehouseName: 'Kho Thủ Đức',
  address: 'Thủ Đức, Hồ Chí Minh',
  status: 'Active',
  zoneCount: 2,
  createdAt: '2026-08-09T00:00:00.000Z',
  modifiedAt: '2026-08-09T01:00:00.000Z',
}

let currentPathname = `/warehouses/${warehouse.id}`
let warehouseData = warehouse
const routerPush = vi.fn()

const updateMutation = {
  isPending: false,
  mutateAsync: vi.fn(),
}

const deactivateMutation = {
  isPending: false,
  mutateAsync: vi.fn(),
}

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('../../hooks/use-warehouse', () => ({
  useWarehouseQuery: () => ({
    data: warehouseData,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateWarehouseMutation: () => updateMutation,
  useDeactivateWarehouseMutation: () => deactivateMutation,
}))

function setRole(role: UserRole) {
  useAuthStore.setState({
    user: {
      id: 'user-1',
      tenantId: 'tenant-1',
      fullName: 'Warehouse User',
      email: 'warehouse.user@sswms.local',
      role,
      isActive: true,
    },
  })
}

describe('WarehouseWorkspaceLayout', () => {
  beforeEach(() => {
    currentPathname = `/warehouses/${warehouse.id}`
    warehouseData = warehouse
    updateMutation.mutateAsync.mockReset()
    deactivateMutation.mutateAsync.mockReset()
    routerPush.mockReset()
    useWarehouseLayoutEditorStore.setState({ dirtyWarehouseIds: new Set() })
    setRole(USER_ROLES.TenantOwner)
  })

  it('renders route-backed workspace navigation and owner actions', async () => {
    const user = userEvent.setup()

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.getByRole('heading', { name: warehouse.warehouseName })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Thông tin' })).toHaveAttribute(
      'href',
      `/warehouses/${warehouse.id}`
    )
    expect(screen.getByRole('link', { name: 'Bố cục kho' })).toHaveAttribute(
      'href',
      `/warehouses/${warehouse.id}/layout`
    )
    expect(screen.getByRole('link', { name: 'Thông tin' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument()
    expect(screen.getByText('Nội dung kho')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tác vụ kho' }))
    expect(await screen.findByRole('menuitem', { name: 'Ngừng hoạt động kho' })).toBeInTheDocument()
  })

  it('allows managers to edit assigned warehouses without owner-only deactivation', () => {
    currentPathname = `/warehouses/${warehouse.id}/layout`
    setRole(USER_ROLES.WarehouseManager)

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Bố cục</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.getByRole('link', { name: 'Bố cục kho' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tác vụ kho' })).not.toBeInTheDocument()
    expect(screen.getByText('Bố cục')).toBeInTheDocument()
  })

  it('hides owner actions for an inactive warehouse', () => {
    warehouseData = { ...warehouse, status: 'Inactive' }

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.queryByRole('button', { name: 'Chỉnh sửa' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tác vụ kho' })).not.toBeInTheDocument()
  })

  it('hides owner-only actions for warehouse staff', () => {
    setRole(USER_ROLES.WarehouseStaff)

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.queryByRole('button', { name: 'Chỉnh sửa' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tác vụ kho' })).not.toBeInTheDocument()
  })

  it('deactivates the warehouse after explicit confirmation', async () => {
    const user = userEvent.setup()

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    await user.click(screen.getByRole('button', { name: 'Tác vụ kho' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Ngừng hoạt động kho' }))
    await user.click(screen.getByRole('button', { name: 'Xác nhận ngừng hoạt động' }))

    expect(deactivateMutation.mutateAsync).toHaveBeenCalledWith(warehouse.id)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('keeps the dialog open and shows a backend deactivation failure', async () => {
    const user = userEvent.setup()
    deactivateMutation.mutateAsync.mockRejectedValueOnce({
      message: 'Kho vẫn còn tồn kho và chưa thể ngừng hoạt động.',
    })

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    await user.click(screen.getByRole('button', { name: 'Tác vụ kho' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Ngừng hoạt động kho' }))
    await user.click(screen.getByRole('button', { name: 'Xác nhận ngừng hoạt động' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Kho vẫn còn tồn kho và chưa thể ngừng hoạt động.'
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('confirms route navigation when the designer has an unsaved draft', async () => {
    const user = userEvent.setup()
    currentPathname = `/warehouses/${warehouse.id}/layout/designer`
    useWarehouseLayoutEditorStore.getState().setWarehouseDirty(warehouse.id, true)
    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Trình thiết kế</p>
      </WarehouseWorkspaceLayout>
    )

    await user.click(screen.getByRole('link', { name: 'Vị trí' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Rời trình thiết kế?')
    expect(routerPush).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Rời trang' }))
    expect(routerPush).toHaveBeenCalledWith(`/warehouses/${warehouse.id}/locations`)
  })
})
