import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/lib/logger'
import { getApiErrorMessage } from '@/lib/api-error'
import { productService } from '../services/product.service'
import {
  useChangeProductUnitConversionStatusMutation,
  useUpdateProductUnitConversionMutation,
} from './use-products'

describe('stocked-capacity conversion errors', () => {
  afterEach(() => vi.restoreAllMocks())
  it('preserves the Vietnamese lock message without console.error on factor updates', async () => {
    const error = { statusCode: 409, message: 'Không thể thay đổi quy đổi vì vị trí vẫn còn hàng.' }
    vi.spyOn(productService, 'updateUnitConversion').mockRejectedValueOnce(error)
    const warning = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
    const consoleError = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const hook = renderHook(() => useUpdateProductUnitConversionMutation('product'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })
    await act(async () => {
      await expect(
        hook.result.current.mutateAsync({
          conversionId: 'conversion',
          request: { conversionFactor: 30 },
        })
      ).rejects.toEqual(error)
    })
    expect(warning).toHaveBeenCalledWith(`[409] ${error.message}`)
    expect(consoleError).not.toHaveBeenCalled()
    await waitFor(() => expect(getApiErrorMessage(hook.result.current.error)).toBe(error.message))
    vi.restoreAllMocks()
  })
  it('preserves the lock on conversion deactivation', async () => {
    const error = {
      statusCode: 409,
      message: 'Không thể ngừng quy đổi đang được dùng bởi vị trí có hàng.',
    }
    vi.spyOn(productService, 'changeUnitConversionStatus').mockRejectedValueOnce(error)
    const warning = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
    const consoleError = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const hook = renderHook(() => useChangeProductUnitConversionStatusMutation('product'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })
    await act(async () => {
      await expect(
        hook.result.current.mutateAsync({ conversionId: 'conversion', status: 'Inactive' })
      ).rejects.toEqual(error)
    })
    expect(warning).toHaveBeenCalledWith(`[409] ${error.message}`)
    expect(consoleError).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
