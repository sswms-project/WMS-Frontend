import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { PermissionResponse, RoleResponse } from '../../types/admin.types'
import { RolePermissionsSheet } from './RolePermissionsSheet'

function createPermission(overrides: Partial<PermissionResponse> = {}): PermissionResponse {
  return {
    id: 'products-view',
    permissionKey: 'products:view',
    module: 'products',
    displayName: 'Xem sản phẩm',
    moduleDisplayName: 'Sản phẩm',
    description: 'Xem danh mục sản phẩm.',
    category: 'catalog',
    categoryDisplayName: 'Danh mục',
    categoryDescription: 'Vật tư hàng hóa, nhóm và đơn vị tính.',
    categoryOrder: 5,
    moduleOrder: 0,
    scope: 'TenantDelegatable',
    ...overrides,
  }
}

const platformPermission = createPermission({
  id: 'roles-view',
  permissionKey: 'roles:view',
  module: 'roles',
  displayName: 'Xem vai trò',
  moduleDisplayName: 'Phân quyền',
  category: 'platform-administration',
  categoryDisplayName: 'Quản trị nền tảng',
  categoryDescription: 'Đơn vị thuê, phân quyền và gói đăng ký.',
  categoryOrder: 1,
  moduleOrder: 1,
  scope: 'PlatformOnly',
})

const role: RoleResponse = {
  id: 'manager-role',
  roleName: 'Warehouse Manager',
  description: null,
  isSystemRole: true,
  parentRoleId: null,
  permissions: [],
}

function renderSheet() {
  return render(
    <TooltipProvider>
      <RolePermissionsSheet
        open
        role={role}
        permissions={[createPermission(), platformPermission]}
        canManagePlatformPermissions={false}
        isLoading={false}
        isError={false}
        isSaving={false}
        onOpenChange={vi.fn()}
        onRetry={vi.fn()}
        onSave={vi.fn()}
      />
    </TooltipProvider>
  )
}

describe('RolePermissionsSheet', () => {
  it('hides platform-only permissions from tenant roles', () => {
    renderSheet()

    expect(
      screen.getByText('Quyền quản trị nền tảng không áp dụng cho vai trò doanh nghiệp.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Quản trị nền tảng')).not.toBeInTheDocument()
  })

  it('asks before discarding a changed permission draft', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: /Sản phẩm/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Xem sản phẩm' }))
    await user.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Bỏ các thay đổi chưa lưu?')).toBeInTheDocument()
  })
})
