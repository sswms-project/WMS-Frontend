import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { PermissionResponse } from '../../types/admin.types'
import { groupAdminPermissions } from '../../utils/permission-catalog'
import { PermissionCatalog } from './PermissionCatalog'

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

const permissions = [
  createPermission(),
  createPermission({
    id: 'products-create',
    permissionKey: 'products:create',
    displayName: 'Tạo sản phẩm',
  }),
  createPermission({
    id: 'roles-view',
    permissionKey: 'roles:view',
    module: 'roles',
    moduleDisplayName: 'Phân quyền',
    displayName: 'Xem vai trò',
    category: 'platform-administration',
    categoryDisplayName: 'Quản trị nền tảng',
    categoryDescription: 'Đơn vị thuê, phân quyền và gói đăng ký.',
    categoryOrder: 1,
    moduleOrder: 1,
    scope: 'PlatformOnly',
  }),
]

const groups = groupAdminPermissions(permissions)

describe('PermissionCatalog', () => {
  it('labels platform-only permissions in the read-only catalog', () => {
    render(
      <TooltipProvider>
        <PermissionCatalog mode="readOnly" groups={groups} searchText="vai trò" />
      </TooltipProvider>
    )

    expect(screen.getByText('Chỉ Quản trị hệ thống')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('opens search results and applies a module toggle to the complete module', async () => {
    const user = userEvent.setup()
    const onToggleModule = vi.fn()

    render(
      <TooltipProvider>
        <PermissionCatalog
          mode="editable"
          groups={groups}
          searchText="Xem sản phẩm"
          selectedIds={new Set<string>()}
          onTogglePermission={vi.fn()}
          onToggleModule={onToggleModule}
        />
      </TooltipProvider>
    )

    expect(screen.getByText('Xem sản phẩm')).toBeInTheDocument()
    expect(screen.queryByText('Tạo sản phẩm')).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Chọn tất cả quyền trong Sản phẩm' }))

    expect(onToggleModule).toHaveBeenCalledWith(['products-create', 'products-view'])
  })
})
