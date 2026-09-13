import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/lib/query-keys'
import {
  useResetTenantUserPermissionsMutation,
  useUpdateTenantUserPermissionsMutation,
} from './use-tenant-access-control'

const service = vi.hoisted(() => ({
  assignUserPermissions: vi.fn(),
  resetUserPermissions: vi.fn(),
}))

vi.mock('../services/tenant-access-control.service', () => ({
  tenantAccessControlService: service,
}))

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { readonly children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('tenant user permission mutations', () => {
  const userId = '79e8c85b-7786-44d5-b507-bb44e722adcb'
  const expectedRoleId = '1a13e448-0388-da07-2782-cf395c564951'

  it('invalidates only the selected workspace and personal subject summaries after save', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    service.assignUserPermissions.mockResolvedValue(response())
    const { result } = renderHook(() => useUpdateTenantUserPermissionsMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(() =>
      result.current.mutateAsync({ userId, body: { expectedRoleId, permissionIds: [] } })
    )

    expect(service.assignUserPermissions).toHaveBeenCalledWith(userId, {
      expectedRoleId,
      permissionIds: [],
    })
    expect(invalidate).toHaveBeenNthCalledWith(1, {
      queryKey: queryKeys.tenantUserPermissions.detail(userId),
    })
    expect(invalidate).toHaveBeenNthCalledWith(2, {
      queryKey: queryKeys.tenantUserPermissions.allSubjects,
    })
  })

  it('sends only the expected role and invalidates the same personal scope after reset', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    service.resetUserPermissions.mockResolvedValue(response())
    const { result } = renderHook(() => useResetTenantUserPermissionsMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(() => result.current.mutateAsync({ userId, body: { expectedRoleId } }))

    expect(service.resetUserPermissions).toHaveBeenCalledWith(userId, { expectedRoleId })
    expect(invalidate).toHaveBeenCalledTimes(2)
  })
})

function response() {
  return { isSuccess: true, statusCode: 200, message: 'OK', data: null }
}
