'use client'

import { CircleCheck, ScanLine } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface ScanInputProps {
  readonly id: string
  readonly label: string
  readonly description?: string
  /** Giá trị đã được xác nhận hợp lệ; hiển thị dấu tích khi có. */
  readonly confirmedValue?: string
  readonly error?: string | null
  readonly disabled?: boolean
  readonly autoFocus?: boolean
  /** Chuyển con trỏ vào ô khi giá trị này chuyển sang true: máy quét gõ thẳng vào ô đang focus nên bước kế tiếp phải được focus sẵn. */
  readonly focusWhen?: boolean
  readonly pending?: boolean
  readonly onScan: (code: string) => void
}

/** Ô nhận mã từ máy quét dạng bàn phím (kết thúc bằng Enter) hoặc nhập tay rồi bấm xác nhận. */
export function ScanInput({
  id,
  label,
  description,
  confirmedValue,
  error,
  disabled = false,
  autoFocus = false,
  focusWhen = false,
  pending = false,
  onScan,
}: ScanInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusWhen) inputRef.current?.focus()
  }, [focusWhen])
  const isConfirmed = Boolean(confirmedValue) && !error

  function submit() {
    const code = value.trim()
    if (!code || disabled || pending) return
    onScan(code)
    setValue('')
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id} className="gap-2">
        {label}
        {isConfirmed ? (
          <span
            className="text-primary inline-flex items-center gap-1 font-mono text-xs"
            translate="no"
          >
            <CircleCheck className="size-3.5" aria-hidden="true" />
            {confirmedValue}
          </span>
        ) : null}
      </FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          ref={inputRef}
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="done"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="h-11 font-mono text-base"
          placeholder="Quét hoặc nhập mã rồi nhấn Enter"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // Máy quét thường kết thúc bằng Enter, một số máy cấu hình Tab: cả hai đều là "quét xong".
            const isScanTerminator =
              event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)
            if (!isScanTerminator) return
            if (event.key === 'Tab' && !value.trim()) return
            event.preventDefault()
            submit()
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0"
          disabled={disabled || pending || !value.trim()}
          onClick={submit}
        >
          <ScanLine aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Xác nhận</span>
        </Button>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
