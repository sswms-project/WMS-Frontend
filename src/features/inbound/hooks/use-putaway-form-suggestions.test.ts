import { act, renderHook } from '@testing-library/react'
import { useFieldArray, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SlotOption } from '../components/PutawayDetailPage'
import type { PutawayFormValues } from '../schemas/inbound.schema'
import type { GoodsReceiptDetail, PutAwaySuggestionsResponse } from '../types/inbound.types'
import { usePutawayFormSuggestions } from './use-putaway-form-suggestions'

const mutateAsync = vi.hoisted(() => vi.fn())
vi.mock('./use-inbound', () => ({
  usePutawayFormSuggestionsMutation: () => ({ mutateAsync, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn() } }))

const baseUnitId = '10000000-0000-4000-8000-000000000003'
const itemId = '10000000-0000-4000-8000-000000000001'
const receipt = {
  id: 'receipt',
  items: [
    {
      id: itemId,
      inboundRequestItemId: 'request-item',
      productId: 'product',
      baseUnitId,
      enteredUnitId: baseUnitId,
      remainingPutAwayQuantity: 100,
      allowedUnits: [{ unitId: baseUnitId, conversionFactor: 1, quantityPrecision: 0 }],
    },
  ],
} as unknown as GoodsReceiptDetail

const slots: SlotOption[] = [
  { id: '10000000-0000-4000-8000-0000000000a1', code: 'A-01' },
  { id: '10000000-0000-4000-8000-0000000000b1', code: 'B-01' },
  { id: '10000000-0000-4000-8000-0000000000f1', code: 'C-01', unavailableReason: 'Vị trí đã đầy' },
] as SlotOption[]

const response: PutAwaySuggestionsResponse = {
  isAiAssisted: true,
  aiNotice: null,
  items: [
    {
      goodsReceiptItemId: itemId,
      remainingQuantity: 100,
      suggestions: [
        '10000000-0000-4000-8000-0000000000f1',
        '10000000-0000-4000-8000-0000000000a1',
        '10000000-0000-4000-8000-0000000000f2',
      ].map((slotId) => ({
        slotId,
        slotCode: slotId,
        rackCode: 'KE',
        zoneName: 'Khu',
        score: 1,
        reason: 'ok',
        source: 'Ai' as const,
        warnings: [],
      })),
    },
  ],
}

function setup(lines: PutawayFormValues['lines']) {
  return renderHook(() => {
    const form = useForm<PutawayFormValues>({ defaultValues: { lines } })
    const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
    const suggestion = usePutawayFormSuggestions({
      receipt,
      form,
      append: fieldArray.append,
      slots,
    })
    return { form, suggestion }
  })
}

const line = (slotId: string, quantity = 100) => ({
  goodsReceiptItemId: itemId,
  slotId,
  enteredQuantity: quantity,
  enteredUnitId: baseUnitId,
})

describe('usePutawayFormSuggestions', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({ data: response })
  })

  it('keeps only slots the form can actually select', async () => {
    const { result } = setup([line('')])

    await act(async () => result.current.suggestion.onSuggest())

    expect(
      result.current.suggestion.suggestions?.items[0]?.suggestions.map((value) => value.slotId)
    ).toEqual(['10000000-0000-4000-8000-0000000000a1'])
  })

  it('fills the empty allocation line with the chosen slot', async () => {
    const { result } = setup([line('')])
    await act(async () => result.current.suggestion.onSuggest())

    act(() => result.current.suggestion.onApply(itemId, '10000000-0000-4000-8000-0000000000a1'))

    expect(result.current.form.getValues('lines')).toHaveLength(1)
    expect(result.current.form.getValues('lines.0.slotId')).toBe(
      '10000000-0000-4000-8000-0000000000a1'
    )
  })

  it('adds a new line with the unallocated quantity when every line already has a slot', async () => {
    const { result } = setup([line('10000000-0000-4000-8000-0000000000b1', 60)])

    act(() => result.current.suggestion.onApply(itemId, '10000000-0000-4000-8000-0000000000a1'))

    const lines = result.current.form.getValues('lines')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toMatchObject({
      slotId: '10000000-0000-4000-8000-0000000000a1',
      enteredQuantity: 40,
    })
  })

  it('does not duplicate a slot that is already allocated', () => {
    const { result } = setup([line('10000000-0000-4000-8000-0000000000a1')])

    act(() => result.current.suggestion.onApply(itemId, '10000000-0000-4000-8000-0000000000a1'))

    expect(result.current.form.getValues('lines')).toHaveLength(1)
  })
})
