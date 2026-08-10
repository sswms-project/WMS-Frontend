import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import { WarehousePage } from './WarehousePage'

const warehouseHooks = vi.hoisted(() => ({
  createMutation: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  warehousesQuery: {
    data: { items: [], totalCount: 0 },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  },
}))

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value,
}))

vi.mock('../hooks/use-warehouse', () => ({
  useCreateWarehouseMutation: () => warehouseHooks.createMutation,
  useWarehousesQuery: () => warehouseHooks.warehousesQuery,
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

function renderWarehousePage() {
  return render(
    <TooltipProvider>
      <WarehousePage />
    </TooltipProvider>
  )
}

describe('WarehousePage role actions', () => {
  beforeEach(() => {
    warehouseHooks.createMutation.mutateAsync.mockReset()
    warehouseHooks.warehousesQuery.refetch.mockReset()
  })

  it('keeps create entry points available for the tenant owner', () => {
    setRole(USER_ROLES.TenantOwner)

    renderWarehousePage()

    expect(screen.getAllByRole('button', { name: 'Tạo kho' })).toHaveLength(2)
  })

  it('keeps the shared warehouse list read-only for a manager', () => {
    setRole(USER_ROLES.WarehouseManager)

    renderWarehousePage()

    expect(screen.queryByRole('button', { name: 'Tạo kho' })).not.toBeInTheDocument()
    expect(screen.getByText('Chưa có kho phù hợp')).toBeInTheDocument()
  })
})
