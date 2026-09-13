import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/lib/query-keys'
import { usePersonnelImportCommitMutation } from './use-personnel-import'

const service = vi.hoisted(() => ({ commit: vi.fn() }))

vi.mock('../services/personnel-import.service', () => ({
  personnelImportService: {
    commit: service.commit,
  },
}))

describe('usePersonnelImportCommitMutation', () => {
  it('commits once and invalidates the import and invitation caches', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    service.commit.mockResolvedValue({ isSuccess: true, statusCode: 200, message: '', data: null })
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => usePersonnelImportCommitMutation(), { wrapper })

    await act(() =>
      result.current.mutateAsync({
        importId: 'import-id',
        selectedRowNumbers: [2, 3],
        rowVersion: 'AQID',
      })
    )

    expect(service.commit).toHaveBeenCalledOnce()
    expect(service.commit).toHaveBeenCalledWith('import-id', {
      selectedRowNumbers: [2, 3],
      rowVersion: 'AQID',
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.staff.personnelImport('import-id'),
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.staff.allInvitations })
  })
})
