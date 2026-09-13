import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useInvitationWarehousesInfiniteQuery } from './use-manager-assignment'

const service = vi.hoisted(() => ({ getWarehouses: vi.fn() }))

vi.mock('../services/manager-assignment.service', () => ({
  managerAssignmentService: {
    getWarehouses: service.getWarehouses,
  },
}))

describe('useInvitationWarehousesInfiniteQuery', () => {
  it('uses server-side search and requests the next page from the loaded offset', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    service.getWarehouses.mockImplementation(({ skip }: { skip: number }) =>
      Promise.resolve({
        data: {
          totalCount: 101,
          items: Array.from({ length: skip === 0 ? 100 : 1 }, (_, index) => ({
            id: `${skip + index}`,
            warehouseCode: `WH-${skip + index}`,
            warehouseName: `Kho ${skip + index}`,
            status: 'Active',
          })),
        },
      })
    )
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useInvitationWarehousesInfiniteQuery('miền nam'), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(service.getWarehouses).toHaveBeenNthCalledWith(1, {
      top: 100,
      skip: 0,
      needTotalCount: true,
      status: 'Active',
      searchText: 'miền nam',
    })

    await act(async () => {
      await result.current.fetchNextPage()
    })

    expect(service.getWarehouses).toHaveBeenNthCalledWith(2, {
      top: 100,
      skip: 100,
      needTotalCount: true,
      status: 'Active',
      searchText: 'miền nam',
    })
  })
})
