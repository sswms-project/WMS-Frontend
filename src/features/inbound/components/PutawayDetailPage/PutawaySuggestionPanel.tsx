'use client'

import { Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GoodsReceiptItem, PutAwaySuggestionsResponse } from '../../types/inbound.types'

export interface PutawaySuggestionState {
  readonly suggestions: PutAwaySuggestionsResponse | null
  readonly isSuggesting: boolean
  readonly onSuggest: () => void
  readonly onApply: (itemId: string, slotId: string) => void
  readonly onApplyBest: () => void
  readonly onClear: () => void
}

interface PutawaySuggestionPanelProps {
  readonly items: readonly GoodsReceiptItem[]
  readonly state: PutawaySuggestionState
  readonly disabled: boolean
}

/** Gợi ý vị trí cất do AI sắp xếp; chỉ điền vào form, người dùng vẫn phải xác nhận cất hàng. */
export function PutawaySuggestionPanel({ items, state, disabled }: PutawaySuggestionPanelProps) {
  const { suggestions } = state
  if (!suggestions) return null
  const itemById = new Map(items.map((item) => [item.id, item]))
  const entries = suggestions.items.filter((entry) => entry.suggestions.length > 0)

  return (
    <section
      className="bg-muted/40 animate-in fade-in-0 slide-in-from-top-2 animation-duration-250 border-b p-4 motion-reduce:animate-none"
      aria-label="Gợi ý vị trí cất hàng"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles aria-hidden="true" className="text-tertiary size-4" />
          Gợi ý vị trí cất
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {entries.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={state.onApplyBest}
            >
              Áp dụng gợi ý tốt nhất
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Ẩn gợi ý"
            onClick={state.onClear}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mb-3 text-xs" role="status">
        {suggestions.isAiAssisted
          ? 'Gợi ý đã được AI sắp xếp theo vị trí cùng sản phẩm, còn đủ sức chứa. Bạn vẫn quyết định cuối cùng.'
          : (suggestions.aiNotice ?? 'Gợi ý theo quy tắc kho.')}
      </p>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          Không có vị trí nào đủ chứa toàn bộ số lượng còn lại. Hãy chia sang nhiều vị trí.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const item = itemById.get(entry.goodsReceiptItemId)
            return (
              <li key={entry.goodsReceiptItemId}>
                <p className="mb-1 text-xs font-medium">
                  {item ? `${item.productSKU} - ${item.productName}` : 'Sản phẩm'}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {entry.suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.slotId}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-in fade-in-0 slide-in-from-left-2 fill-mode-backwards animation-duration-200 flex flex-wrap items-center justify-between gap-2 text-xs motion-reduce:animate-none"
                    >
                      <span className="min-w-0 flex-1 break-words">
                        <strong className="font-mono">{suggestion.slotCode}</strong>
                        <span className="text-muted-foreground">
                          {' '}
                          · {suggestion.zoneName} · {suggestion.reason}
                        </span>
                        {suggestion.source === 'Ai' ? (
                          <Badge className="bg-tertiary-container text-on-tertiary-container ml-1.5">
                            AI
                          </Badge>
                        ) : null}
                        {suggestion.warnings.map((warning) => (
                          <span key={warning} className="text-warning block">
                            {warning}
                          </span>
                        ))}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() => state.onApply(entry.goodsReceiptItemId, suggestion.slotId)}
                      >
                        Dùng vị trí này
                      </Button>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
