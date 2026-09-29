import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PermissionEditorHeader } from './PermissionEditorHeader'

const handlers = {
  onSearchChange: vi.fn(),
  onCollapseAll: vi.fn(),
  onDiscard: vi.fn(),
  onSave: vi.fn(),
}

function renderHeader(element: ReactNode) {
  return render(<TooltipProvider>{element}</TooltipProvider>)
}

describe('PermissionEditorHeader', () => {
  it('chỉ hiển thị trạng thái xem khi người dùng không có quyền quản lý', () => {
    renderHeader(
      <PermissionEditorHeader
        selectedCount={2}
        permissionCount={4}
        moduleCount={1}
        searchText=""
        canManage={false}
        dirty={false}
        pending={false}
        canCollapse={false}
        {...handlers}
      />
    )

    expect(screen.getByText('Chỉ xem')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu thay đổi' })).not.toBeInTheDocument()
  })

  it('hiển thị thao tác lưu khi người dùng có quyền quản lý', () => {
    renderHeader(
      <PermissionEditorHeader
        selectedCount={2}
        permissionCount={4}
        moduleCount={1}
        searchText=""
        canManage
        dirty
        pending={false}
        canCollapse={false}
        {...handlers}
      />
    )

    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Bỏ thay đổi' })).toBeEnabled()
  })
})
