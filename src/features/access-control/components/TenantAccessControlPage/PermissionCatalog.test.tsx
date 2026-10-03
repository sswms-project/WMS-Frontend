import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  {
    category: 'warehouse-management',
    categoryDisplayName: 'Quản lý kho',
    categoryDescription: 'Kho hàng và cấu trúc lưu trữ.',
    categoryOrder: 5,
    modules: [
      {
        module: 'warehouses',
        moduleDisplayName: 'Kho hàng',
        moduleOrder: 0,
        permissions: [
          {
            id: 'warehouses-view',
            permissionKey: 'warehouses:view',
            module: 'warehouses',
            moduleDisplayName: 'Kho hàng',
            displayName: 'Xem kho hàng',
            description: 'Xem danh sách và thông tin kho hàng.',
            category: 'warehouse-management',
            categoryDisplayName: 'Quản lý kho',
            categoryDescription: 'Kho hàng và cấu trúc lưu trữ.',
            categoryOrder: 5,
            moduleOrder: 0,
          },
        ],
      },
    ],
  },
]

const filteredProductGroups: PermissionCategoryGroup[] = [
  {
    ...groups[0]!,
    modules: [
      {
        ...groups[0]!.modules[0]!,
        permissions: [groups[0]!.modules[0]!.permissions[0]!],
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
    expect(screen.getAllByText('1/2')).not.toHaveLength(0)
    expect(screen.getByRole('combobox', { name: 'Danh mục quyền' })).toBeInTheDocument()

    const moduleCheckbox = screen.getByRole('checkbox', {
      name: 'Chọn tất cả quyền trong Sản phẩm',
    })
    expect(moduleCheckbox).toHaveAttribute('data-state', 'indeterminate')

    await user.click(moduleCheckbox)

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

  it('uses categories only for navigation and preserves the permission draft when switching', async () => {
    const user = userEvent.setup()
    render(
      <PermissionCatalog
        groups={groups}
        context={{
          kind: 'role',
          subjectId: 'manager-role',
          selectedIds: new Set(['products-view']),
        }}
        openModules={[]}
        hasSearch={false}
        {...handlers}
      />
    )

    const navigation = screen.getByRole('navigation', { name: 'Chọn danh mục quyền' })
    const catalogButton = within(navigation).getByRole('button', { name: /Danh mục/ })
    const warehouseButton = within(navigation).getByRole('button', { name: /Quản lý kho/ })

    expect(catalogButton).toHaveAttribute('aria-current', 'true')
    expect(catalogButton).toHaveAttribute('data-variant', 'default')
    expect(within(catalogButton).getByLabelText('1 trên 2 quyền đã chọn')).toHaveAttribute(
      'data-variant',
      'outline'
    )
    expect(
      screen.queryByRole('checkbox', { name: 'Chọn tất cả quyền trong Danh mục' })
    ).not.toBeInTheDocument()

    await user.click(warehouseButton)

    expect(warehouseButton).toHaveAttribute('aria-current', 'true')
    expect(warehouseButton).toHaveAttribute('data-variant', 'default')
    expect(catalogButton).toHaveAttribute('data-variant', 'ghost')
    expect(screen.getByRole('heading', { name: 'Quản lý kho' })).toBeInTheDocument()
    expect(screen.getByText('Kho hàng và cấu trúc lưu trữ.')).toBeInTheDocument()
    expect(handlers.onTogglePermission).not.toHaveBeenCalled()
    expect(handlers.onToggleModule).not.toHaveBeenCalled()
  })

  it('falls back to the first valid category when filtering removes the current category', async () => {
    const user = userEvent.setup()
    const props = {
      context: {
        kind: 'role' as const,
        subjectId: 'manager-role',
        selectedIds: new Set<string>(),
      },
      openModules: [],
      hasSearch: false,
      ...handlers,
    }
    const { rerender } = render(<PermissionCatalog groups={groups} {...props} />)

    await user.click(
      within(screen.getByRole('navigation', { name: 'Chọn danh mục quyền' })).getByRole('button', {
        name: /Quản lý kho/,
      })
    )
    expect(screen.getByRole('heading', { name: 'Quản lý kho' })).toBeInTheDocument()

    rerender(<PermissionCatalog groups={[groups[0]!]} {...props} />)

    expect(screen.getByRole('heading', { name: 'Danh mục' })).toBeInTheDocument()
  })

  it('opens matching modules while a search or custom filter is active', () => {
    render(
      <PermissionCatalog
        groups={groups}
        context={{
          kind: 'role',
          subjectId: 'manager-role',
          selectedIds: new Set<string>(),
        }}
        openModules={[]}
        hasSearch
        {...handlers}
      />
    )

    expect(screen.getByText('Xem sản phẩm')).toBeInTheDocument()
    expect(screen.getByText('Tạo sản phẩm')).toBeInTheDocument()
  })

  it('keeps complete module counts and bulk selection while role search filters rows', async () => {
    const user = userEvent.setup()
    const onToggleModule = vi.fn()
    render(
      <PermissionCatalog
        groups={filteredProductGroups}
        completeGroups={groups}
        context={{
          kind: 'role',
          subjectId: 'manager-role',
          selectedIds: new Set(['products-view']),
        }}
        openModules={[]}
        hasSearch
        {...handlers}
        onToggleModule={onToggleModule}
      />
    )

    expect(screen.getAllByText('1/2')).not.toHaveLength(0)
    expect(screen.queryByText('Tạo sản phẩm')).not.toBeInTheDocument()

    const moduleCheckbox = screen.getByRole('checkbox', {
      name: 'Chọn tất cả quyền trong Sản phẩm',
    })
    expect(moduleCheckbox).toHaveAttribute('data-state', 'indeterminate')
    await user.click(moduleCheckbox)

    expect(onToggleModule).toHaveBeenCalledWith(['products-view', 'products-create'])
  })

  it('keeps complete module bulk selection in the personal customized view', async () => {
    const user = userEvent.setup()
    const onToggleModule = vi.fn()
    render(
      <PermissionCatalog
        groups={filteredProductGroups}
        completeGroups={groups}
        context={{
          kind: 'personal',
          subjectId: 'staff-user',
          selectedIds: new Set(['products-view']),
          roleDefaultIds: new Set(),
        }}
        openModules={[]}
        hasSearch
        {...handlers}
        onToggleModule={onToggleModule}
      />
    )

    await user.click(screen.getByRole('checkbox', { name: 'Chọn tất cả quyền trong Sản phẩm' }))

    expect(onToggleModule).toHaveBeenCalledWith(['products-view', 'products-create'])
  })

  it('supports keyboard navigation between categories', async () => {
    const user = userEvent.setup()
    render(
      <PermissionCatalog
        groups={groups}
        context={{
          kind: 'role',
          subjectId: 'manager-role',
          selectedIds: new Set<string>(),
        }}
        openModules={[]}
        hasSearch={false}
        {...handlers}
      />
    )

    const warehouseButton = within(
      screen.getByRole('navigation', { name: 'Chọn danh mục quyền' })
    ).getByRole('button', { name: /Quản lý kho/ })
    warehouseButton.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Quản lý kho' })).toBeInTheDocument()
  })
})
