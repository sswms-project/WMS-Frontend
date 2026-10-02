import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PermissionCategoryGroup } from '../../types/tenant-access-control.types'
import { PermissionCatalog } from './PermissionCatalog'

const groups: PermissionCategoryGroup[] = [
  {
    category: 'catalog',
    categoryDisplayName: 'Danh mục',
    categoryDescription: 'Vật tư hàng hóa, nhóm và đơn vị tính.',
    categoryOrder: 4,
    modules: [
      {
        module: 'products',
        moduleDisplayName: 'Sản phẩm',
        moduleOrder: 0,
        permissions: [
          {
            id: 'products-view',
            permissionKey: 'products:view',
            module: 'products',
            moduleDisplayName: 'Sản phẩm',
            displayName: 'Xem sản phẩm',
            description: 'Xem danh mục và thông tin sản phẩm.',
            category: 'catalog',
            categoryDisplayName: 'Danh mục',
            categoryDescription: 'Vật tư hàng hóa, nhóm và đơn vị tính.',
            categoryOrder: 4,
            moduleOrder: 0,
          },
          {
            id: 'products-create',
            permissionKey: 'products:create',
            module: 'products',
            moduleDisplayName: 'Sản phẩm',
            displayName: 'Tạo sản phẩm',
            description: 'Thêm sản phẩm mới vào danh mục tenant.',
            category: 'catalog',
            categoryDisplayName: 'Danh mục',
            categoryDescription: 'Vật tư hàng hóa, nhóm và đơn vị tính.',
            categoryOrder: 4,
            moduleOrder: 0,
          },
        ],
      },
    ],
  },
]

const handlers = {
  onOpenModulesChange: vi.fn(),
  onTogglePermission: vi.fn(),
  onToggleModule: vi.fn(),
}

describe('PermissionCatalog', () => {
  it('renders the shared category hierarchy and keeps module bulk selection', async () => {
    const user = userEvent.setup()
    render(
      <PermissionCatalog
        groups={groups}
        context={{
          kind: 'role',
          subjectId: 'manager-role',
          selectedIds: new Set(['products-view']),
        }}
        openModules={['products']}
        hasSearch={false}
        {...handlers}
      />
    )

    expect(screen.getByRole('heading', { name: 'Danh mục' })).toBeInTheDocument()
    expect(screen.getByText('Vật tư hàng hóa, nhóm và đơn vị tính.')).toBeInTheDocument()
    expect(screen.getByText('Xem sản phẩm')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Chọn tất cả quyền trong Sản phẩm' }))

    expect(handlers.onToggleModule).toHaveBeenCalledWith(['products-view', 'products-create'])
  })

  it('renders personal permission rows through the same catalog', () => {
    render(
      <PermissionCatalog
        groups={groups}
        context={{
          kind: 'personal',
          subjectId: 'staff-user',
          selectedIds: new Set(['products-view']),
          roleDefaultIds: new Set(),
        }}
        openModules={['products']}
        hasSearch={false}
        {...handlers}
      />
    )

    expect(screen.getByText('Tùy chỉnh')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Xem sản phẩm' })).toBeChecked()
  })
})
