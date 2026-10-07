'use client'

import { CircleCheck, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { matchScannedSlotCode, type ScannableLine } from '../../utils/putaway-plan'

export interface PutawayScanState {
  /** Số dòng bắt buộc quét (vị trí do quản lý giao) và số dòng trong đó đã quét. */
  readonly requiredCount: number
  readonly confirmedCount: number
  /** Người cất báo không quét được mã: phải chọn lý do thay cho bằng chứng quét. */
  readonly skipRequested: boolean
  readonly onSkip: () => void
}

interface PutawayScanBarProps {
  readonly state: PutawayScanState
  readonly lines: readonly ScannableLine[]
  readonly slots: readonly { readonly id: string; readonly code: string }[]
  readonly disabled: boolean
  readonly onConfirm: (index: number, code: string) => void
}

/**
 * Ô quét dùng chung cho cả phiếu: nhân viên đến từng vị trí, quét mã, dòng tương ứng được đánh
 * dấu đã xác nhận. Mã quét là bằng chứng hàng đã vào đúng vị trí quản lý giao.
 */
export function PutawayScanBar({ state, lines, slots, disabled, onConfirm }: PutawayScanBarProps) {
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const missing = state.requiredCount - state.confirmedCount

  function scan() {
    const result = matchScannedSlotCode(code, slots, lines)
    setCode('')
    if (result.status === 'error') {
      setFeedback({ ok: false, message: result.message })
      return
    }
    onConfirm(result.index, result.code)
    setFeedback({ ok: true, message: `Đã xác nhận vị trí ${result.slotCode}.` })
  }

  return (
    <section
      className="bg-muted/40 flex flex-col gap-2 border-b px-4 py-3"
      aria-label="Quét mã vị trí"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
          <ScanLine aria-hidden="true" className="text-primary size-5 shrink-0" />
          <Input
            value={code}
            disabled={disabled}
            autoComplete="off"
            aria-label="Quét mã vị trí vừa cất"
            placeholder="Quét mã vị trí vừa cất hàng vào"
            className="font-mono"
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              // Máy quét gửi Enter sau mã; không để nó gửi cả form cất hàng.
              event.preventDefault()
              scan()
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || code.trim().length === 0}
            onClick={scan}
          >
            Xác nhận
          </Button>
        </div>
        <p className="text-sm tabular-nums" role="status">
          {missing <= 0 ? (
            <span className="text-primary flex items-center gap-1.5 font-medium">
              <CircleCheck aria-hidden="true" className="size-4" />
              Đã quét đủ {state.requiredCount}/{state.requiredCount} vị trí được giao
            </span>
          ) : (
            <>
              Đã quét <strong>{state.confirmedCount}</strong>/{state.requiredCount} vị trí được giao
            </>
          )}
        </p>
        {missing > 0 && !state.skipRequested ? (
          <Button type="button" variant="link" size="sm" disabled={disabled} onClick={state.onSkip}>
            Không quét được mã?
          </Button>
        ) : null}
      </div>
      {feedback ? (
        <p
          className={feedback.ok ? 'text-primary text-xs' : 'text-destructive text-xs'}
          role={feedback.ok ? 'status' : 'alert'}
        >
          {feedback.message}
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Quản lý dùng mã đã quét làm bằng chứng hàng nằm đúng vị trí được giao. Cất xong vị trí nào
          thì quét mã vị trí đó.
        </p>
      )}
    </section>
  )
}
