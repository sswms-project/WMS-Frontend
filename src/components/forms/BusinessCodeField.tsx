'use client'

import type { ComponentProps } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export interface BusinessCodeFieldProps {
  readonly label: string
  readonly inputProps: ComponentProps<typeof Input> & { id: string }
  readonly description?: string
  readonly error?: { message?: string }
  readonly suggestionStatus?: 'loading' | 'error' | 'ready'
}

export function BusinessCodeField({
  label,
  inputProps,
  description,
  error,
  suggestionStatus,
}: BusinessCodeFieldProps) {
  const { id, ...props } = inputProps
  const describedBy =
    [
      props['aria-describedby'],
      description && `${id}-help`,
      error?.message && `${id}-error`,
      suggestionStatus === 'error' && `${id}-suggestion-error`,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <Field data-invalid={Boolean(error?.message)} data-disabled={props.disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        autoComplete="off"
        spellCheck={false}
        {...props}
        id={id}
        placeholder={suggestionStatus === 'loading' ? 'Đang gợi ý mã…' : props.placeholder}
        aria-invalid={Boolean(error?.message)}
        aria-describedby={describedBy}
      />
      {description ? <FieldDescription id={`${id}-help`}>{description}</FieldDescription> : null}
      <FieldError id={`${id}-error`} errors={[error]} />
      {suggestionStatus === 'error' ? (
        <FieldError id={`${id}-suggestion-error`}>
          Không thể gợi ý mã. Bạn có thể nhập mã thủ công.
        </FieldError>
      ) : null}
    </Field>
  )
}
