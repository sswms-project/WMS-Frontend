import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { warehouseService } from '../services/warehouse.service'
import { EMPTY_WAREHOUSE_PHYSICAL_DETAILS } from '../utils/warehouse-physical-details'
import { useUpdateRackMutation, useUpdateSlotMutation } from './use-warehouse'

describe('warehouse edit conflict recovery', () => {
  afterEach(() => vi.restoreAllMocks())
  it.each(['rack', 'slot'] as const)(
    'invalidates cached structure on a %s conflict',
    async (kind) => {
      const error = { statusCode: 409, message: 'Dữ liệu đã thay đổi.' }
      vi.spyOn(
        warehouseService,
        kind === 'rack' ? 'updateRack' : 'updateSlot'
      ).mockRejectedValueOnce(error)
      vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
      const unexpectedError = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
      const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      const invalidate = vi.spyOn(client, 'invalidateQueries')
      const useUpdateLocationMutation =
        kind === 'rack' ? useUpdateRackMutation : useUpdateSlotMutation
      const hook = renderHook(() => useUpdateLocationMutation(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      })
      const common = {
        ...EMPTY_WAREHOUSE_PHYSICAL_DETAILS,
        description: '',
        allowsMixedProducts: true,
        capacity: null,
        capacityType: 'None' as const,
        capacityUnitId: null,
        expectedRowVersion: 'old',
      }
      await act(async () => {
        // Both mutation contracts are exercised with a payload containing their required identifiers.
        await expect(
          hook.result.current.mutateAsync({
            warehouseId: 'warehouse',
            zoneId: 'zone',
            rackId: 'rack',
            slotId: 'slot',
            request: {
              ...common,
              rackCode: 'R',
              rackName: 'Rack',
              storageMode: 'RackLevel',
              slotCode: 'S',
              slotName: 'Slot',
            },
          })
        ).rejects.toEqual(error)
      })
      for (const queryKey of [
        queryKeys.warehouses.layout('warehouse'),
        queryKeys.warehouses.layoutScene('warehouse'),
        queryKeys.warehouses.locationsAll('warehouse'),
        queryKeys.warehouses.detail('warehouse'),
      ]) {
        expect(invalidate).toHaveBeenCalledWith({ queryKey })
      }
      expect(unexpectedError).not.toHaveBeenCalled()
    }
  )
})
