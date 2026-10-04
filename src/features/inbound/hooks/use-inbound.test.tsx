import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/lib/logger'
import { getApiErrorMessage } from '@/lib/api-error'
import { inboundService } from '../services/inbound.service'
import { usePutawayMutation } from './use-inbound'
import { queryKeys } from '@/lib/query-keys'

describe('putaway capacity rejection', () => {
  afterEach(() => vi.restoreAllMocks())
  it.each([true, false])(
    'invalidates capacity caches after success (cached receipt: %s)',
    async (hasReceipt) => {
      vi.spyOn(inboundService, 'putaway').mockResolvedValueOnce({
        isSuccess: true,
        statusCode: 200,
        message: '',
        data: null,
      })
      const client = new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity }, mutations: { retry: false } },
      })
      const warehouseId = 'warehouse-a'
      const keys = [
        queryKeys.warehouses.layout(warehouseId),
        queryKeys.warehouses.layoutScene(warehouseId),
        queryKeys.warehouses.locationsAll(warehouseId),
      ]
      for (const key of keys) client.setQueryData(key, [])
      client.setQueryData(queryKeys.warehouses.layout('warehouse-b'), [])
      if (hasReceipt)
        client.setQueryData(queryKeys.goodsReceipts.detail('receipt'), { warehouseId })
      const hook = renderHook(() => usePutawayMutation(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      })
      await act(async () => {
        await hook.result.current.mutateAsync({
          receiptId: 'receipt',
          request: { lines: [], expectedVersion: 'AQ==', commandId: 'command' },
        })
      })
      for (const key of keys) expect(client.getQueryState(key)?.isInvalidated).toBe(true)
      expect(client.getQueryState(queryKeys.warehouses.layout('warehouse-b'))?.isInvalidated).toBe(
        !hasReceipt
      )
      client.clear()
    }
  )
  it.each([
    'Vị trí A01 không còn đủ sức chứa.',
    'Sản phẩm chưa có quy đổi đang hoạt động sang đơn vị sức chứa.',
  ])('returns the BE message to the form and logs a warning: %s', async (message) => {
    const error = { statusCode: 409, message }
    vi.spyOn(inboundService, 'putaway').mockRejectedValueOnce(error)
    const warning = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
    const consoleError = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const hook = renderHook(() => usePutawayMutation(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })
    await act(async () => {
      await expect(
        hook.result.current.mutateAsync({
          receiptId: 'receipt',
          request: { lines: [], expectedVersion: 'AQ==', commandId: 'command' },
        })
      ).rejects.toEqual(error)
    })
    expect(warning).toHaveBeenCalledWith(`[409] ${message}`)
    expect(consoleError).not.toHaveBeenCalled()
    await waitFor(() => expect(getApiErrorMessage(hook.result.current.error)).toBe(message))
    vi.restoreAllMocks()
  })
})
