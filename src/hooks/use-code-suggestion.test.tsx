import { act, renderHook } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { useCodeSuggestion } from './use-code-suggestion'

function StrictWrapper({ children }: { readonly children: ReactNode }) {
  return <StrictMode>{children}</StrictMode>
}

function setup() {
  let value = ''
  const applyCode = vi.fn((code: string) => {
    value = code
  })
  const initialProps = {
    active: true,
    sessionKey: 'first',
    suggestedCode: undefined as string | undefined,
    isFetching: true,
    isError: false,
  }
  const hook = renderHook(
    (props: typeof initialProps) =>
      useCodeSuggestion({
        ...props,
        getCurrentCode: () => value,
        applyCode,
      }),
    { initialProps, wrapper: StrictWrapper }
  )
  return {
    ...hook,
    initialProps,
    applyCode,
    getValue: () => value,
    setValue: (code: string) => {
      value = code
    },
  }
}

describe('useCodeSuggestion', () => {
  it('does not mark an RHF draft dirty when applying a suggestion', () => {
    const hook = renderHook(() => {
      const form = useForm({ defaultValues: { code: '' } })
      const isDirty = form.formState.isDirty
      useCodeSuggestion({
        active: true,
        sessionKey: 'rhf',
        suggestedCode: 'PN000001',
        isFetching: false,
        isError: false,
        getCurrentCode: () => form.getValues('code'),
        applyCode: (code) => form.setValue('code', code),
      })
      return { form, isDirty }
    })
    expect(hook.result.current.form.getValues('code')).toBe('PN000001')
    expect(hook.result.current.isDirty).toBe(false)
    expect(hook.result.current.form.getFieldState('code').isDirty).toBe(false)
  })

  it('waits for success and applies once in Strict Mode without refetch overwrite', () => {
    const hook = setup()
    hook.rerender({ ...hook.initialProps, suggestedCode: 'PN000001' })
    expect(hook.getValue()).toBe('')
    hook.rerender({ ...hook.initialProps, suggestedCode: 'PN000001', isFetching: false })
    expect(hook.getValue()).toBe('PN000001')
    expect(hook.applyCode).toHaveBeenCalledTimes(1)
    hook.rerender({ ...hook.initialProps, suggestedCode: 'PN000002', isFetching: false })
    expect(hook.getValue()).toBe('PN000001')
  })

  it.each(['CUSTOM01', ''])(
    'never overwrites user input, including intentional clear (%s)',
    (code) => {
      const hook = setup()
      act(() => hook.result.current.markEdited())
      hook.setValue(code)
      hook.rerender({ ...hook.initialProps, suggestedCode: 'KH000001', isFetching: false })
      expect(hook.getValue()).toBe(code)
      expect(hook.applyCode).not.toHaveBeenCalled()
    }
  )

  it('does not fill an edit form, a closed form or a failed cached suggestion', () => {
    const hook = setup()
    hook.rerender({
      ...hook.initialProps,
      active: false,
      suggestedCode: 'NCC000001',
      isFetching: false,
    })
    expect(hook.applyCode).not.toHaveBeenCalled()
    hook.rerender({
      ...hook.initialProps,
      suggestedCode: 'NCC000001',
      isFetching: false,
      isError: true,
    })
    expect(hook.applyCode).not.toHaveBeenCalled()
  })

  it('keeps an existing value even if the field was not marked dirty', () => {
    const hook = setup()
    hook.setValue('EXISTING01')
    hook.rerender({ ...hook.initialProps, suggestedCode: 'IR000001', isFetching: false })
    expect(hook.getValue()).toBe('EXISTING01')
  })

  it('resets interaction for reopen or save-and-add and validates a late successful result', () => {
    const hook = setup()
    act(() => hook.result.current.markEdited())
    act(() => hook.result.current.resetSession())
    hook.setValue('')
    hook.rerender({
      ...hook.initialProps,
      sessionKey: 'second',
      suggestedCode: 'KH000002',
      isFetching: false,
    })
    expect(hook.getValue()).toBe('KH000002')
  })
})
