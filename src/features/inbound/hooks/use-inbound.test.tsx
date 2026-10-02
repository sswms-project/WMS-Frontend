import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/lib/logger'
import { getApiErrorMessage } from '@/lib/api-error'
import { inboundService } from '../services/inbound.service'
import { usePutawayMutation } from './use-inbound'

describe('putaway capacity rejection', () => {
  afterEach(() => vi.restoreAllMocks())
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
        hook.result.current.mutateAsync({ receiptId: 'receipt', request: { lines: [] } })
      ).rejects.toEqual(error)
    })
    expect(warning).toHaveBeenCalledWith(message)
    expect(consoleError).not.toHaveBeenCalled()
    await waitFor(() => expect(getApiErrorMessage(hook.result.current.error)).toBe(message))
    vi.restoreAllMocks()
  })
})
