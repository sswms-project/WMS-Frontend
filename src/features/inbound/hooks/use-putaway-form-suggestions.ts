'use client'

import { useState } from 'react'
import type { UseFieldArrayAppend, UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SlotOption } from '../components/PutawayDetailPage'
import type { PutawayFormValues } from '../schemas/inbound.schema'
import { getPutawayAllocationState } from '../schemas/putaway-allocation.schema'
import type { GoodsReceiptDetail, PutAwaySuggestionsResponse } from '../types/inbound.types'
import { getPutawayRemainingInput } from '../utils/putaway-units'
import { usePutawayFormSuggestionsMutation } from './use-inbound'

interface UsePutawayFormSuggestionsOptions {
  readonly receipt: GoodsReceiptDetail | undefined
  readonly form: UseFormReturn<PutawayFormValues>
  readonly append: UseFieldArrayAppend<PutawayFormValues, 'lines'>
  readonly slots: readonly SlotOption[]
}

/** Gợi ý vị trí ngay trên form cất hàng và điền kết quả được chọn vào các dòng phân bổ. */
export function usePutawayFormSuggestions({
  receipt,
  form,
  append,
  slots,
}: UsePutawayFormSuggestionsOptions) {
  const [response, setResponse] = useState<PutAwaySuggestionsResponse | null>(null)
  const mutation = usePutawayFormSuggestionsMutation()

  // Chỉ giữ vị trí có trong danh sách chọn của form để "Dùng vị trí này" luôn điền được.
  const usableSlotIds = new Set(
    slots.filter((slot) => !slot.unavailableReason).map((slot) => slot.id)
  )
  const suggestions: PutAwaySuggestionsResponse | null = response && {
    ...response,
    items: response.items.map((entry) => ({
      ...entry,
      suggestions: entry.suggestions.filter((suggestion) => usableSlotIds.has(suggestion.slotId)),
    })),
  }

  async function suggest() {
    if (!receipt || mutation.isPending) return
    try {
      const result = await mutation.mutateAsync(receipt.id)
      setResponse(result.data)
      if (result.data.aiNotice) toast.info(result.data.aiNotice)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể lấy gợi ý vị trí. Vui lòng thử lại.'))
    }
  }

  function apply(itemId: string, slotId: string) {
    const item = receipt?.items.find((candidate) => candidate.id === itemId)
    if (!receipt || !item) return
    const lines = form.getValues('lines')
    if (lines.some((line) => line.goodsReceiptItemId === itemId && line.slotId === slotId)) {
      toast.info('Vị trí này đã có trong phân bổ của sản phẩm.')
      return
    }
    const emptyIndex = lines.findIndex((line) => line.goodsReceiptItemId === itemId && !line.slotId)
    if (emptyIndex >= 0) {
      form.setValue(`lines.${emptyIndex}.slotId`, slotId, {
        shouldDirty: true,
        shouldValidate: true,
      })
      return
    }
    const assigned =
      getPutawayAllocationState(lines, receipt.items, slots).assignedByItem.get(itemId) ?? 0
    const remaining = Math.max(0, Math.round(item.remainingPutAwayQuantity * 100) - assigned) / 100
    if (remaining <= 0) {
      toast.info('Dòng hàng này đã được phân bổ đủ số lượng.')
      return
    }
    append({
      goodsReceiptItemId: itemId,
      slotId,
      ...(getPutawayRemainingInput(item, remaining) ?? {
        enteredQuantity: remaining,
        enteredUnitId: item.baseUnitId,
      }),
    })
  }

  function applyBest() {
    for (const entry of suggestions?.items ?? []) {
      const best = entry.suggestions[0]
      const hasEmptyLine = form
        .getValues('lines')
        .some((line) => line.goodsReceiptItemId === entry.goodsReceiptItemId && !line.slotId)
      if (best && hasEmptyLine) apply(entry.goodsReceiptItemId, best.slotId)
    }
  }

  return {
    suggestions,
    isSuggesting: mutation.isPending,
    onSuggest: () => void suggest(),
    onApply: apply,
    onApplyBest: applyBest,
    onClear: () => setResponse(null),
  }
}
