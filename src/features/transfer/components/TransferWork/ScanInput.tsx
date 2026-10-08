'use client'

import { CircleCheck, ScanLine } from 'lucide-react'
import { useState } from 'react'
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
  pending = false,
  onScan,
}: ScanInputProps) {
  const [value, setValue] = useState('')
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
            if (event.key !== 'Enter') return
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
