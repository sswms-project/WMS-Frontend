import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiResponse } from '@/types/api'
import { useNextSupplierCodeQuery } from '@/features/supplier/hooks/use-suppliers'
import { useNextStockRecipientCodeQuery } from '@/features/stock-recipient/hooks/use-stock-recipients'
import { useNextInboundRequestCodeQuery } from '@/features/inbound-request/hooks/use-inbound-requests'
import { useNextGoodsReceiptCodeQuery } from '@/features/inbound/hooks/use-inbound'
import { useCodeSuggestion } from './use-code-suggestion'

const fixtures = vi.hoisted(() => ({ next: vi.fn() }))
vi.mock('@/features/supplier/services/supplier.service', () => ({
  supplierService: { getNextSupplierCode: fixtures.next },
}))
vi.mock('@/features/stock-recipient/services/stock-recipient.service', () => ({
  stockRecipientService: { getNextCode: fixtures.next },
}))
vi.mock('@/features/inbound-request/services/inbound-request.service', () => ({
  inboundRequestService: { getNextCode: fixtures.next },
}))
vi.mock('@/features/inbound/services/inbound.service', () => ({
  inboundService: { getNextReceiptCode: fixtures.next },
}))

function response(code: string): ApiResponse<string> {
  return { isSuccess: true, statusCode: 200, message: '', data: code }
}
function deferred() {
  let resolve!: (value: ApiResponse<string>) => void
  const promise = new Promise<ApiResponse<string>>((complete) => {
    resolve = complete
  })
  return { promise, resolve }
}

beforeEach(() => fixtures.next.mockReset())

describe.each([
  ['supplier', useNextSupplierCodeQuery],
  ['customer', useNextStockRecipientCodeQuery],
  ['inbound request', useNextInboundRequestCodeQuery],
  ['goods receipt', useNextGoodsReceiptCodeQuery],
] as const)('%s suggestion query integration', (_name, useNextCode) => {
  it('isolates late results by session and only fetches during creation', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    function Wrapper({ children }: { readonly children: ReactNode }) {
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>
    }
    let value = ''
    const first = deferred()
    const second = deferred()
    fixtures.next.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const hook = renderHook(
      ({ active, sessionKey }: { active: boolean; sessionKey: string }) => {
        const query = useNextCode(active, sessionKey)
        const code = typeof query.data === 'string' ? query.data : query.data?.data
        const suggestion = useCodeSuggestion({
          active,
          sessionKey,
          suggestedCode: code,
          isFetching: query.isFetching,
          isError: query.isError,
          getCurrentCode: () => value,
          applyCode: (code) => {
            value = code
          },
        })
        return { query, suggestion }
      },
      { initialProps: { active: false, sessionKey: 'first' }, wrapper: Wrapper }
    )
    expect(fixtures.next).not.toHaveBeenCalled()
    hook.rerender({ active: true, sessionKey: 'first' })
    await waitFor(() => expect(fixtures.next).toHaveBeenCalledTimes(1))
    hook.rerender({ active: false, sessionKey: 'first' })
    hook.rerender({ active: true, sessionKey: 'second' })
    await waitFor(() => expect(fixtures.next).toHaveBeenCalledTimes(2))
    await act(async () => first.resolve(response('OLD001')))
    expect(value).toBe('')
    await act(async () => second.resolve(response('NEW002')))
    await waitFor(() => expect(value).toBe('NEW002'))
    hook.unmount()
    client.clear()
  })
})
