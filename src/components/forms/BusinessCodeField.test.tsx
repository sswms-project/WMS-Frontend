import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { BusinessCodeField } from './BusinessCodeField'

describe('BusinessCodeField', () => {
  it('binds label, helper and error without removing caller descriptions', () => {
    render(
      <BusinessCodeField
        label="Mã yêu cầu *"
        description="Mã được gợi ý, có thể chỉnh sửa."
        error={{ message: 'Mã đã tồn tại.' }}
        inputProps={{ id: 'code', 'aria-describedby': 'extra' }}
      />
    )
    const input = screen.getByLabelText('Mã yêu cầu *')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'extra code-help code-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Mã đã tồn tại.')
  })

  it('supports loading and recoverable suggestion errors without disabling typing', async () => {
    const user = userEvent.setup()
    const page = render(
      <BusinessCodeField
        label="Mã"
        suggestionStatus="loading"
        inputProps={{ id: 'code', placeholder: 'VD: PN000001…' }}
      />
    )
    expect(screen.getByLabelText('Mã')).toHaveAttribute('placeholder', 'Đang gợi ý mã…')
    page.rerender(
      <BusinessCodeField label="Mã" suggestionStatus="error" inputProps={{ id: 'code' }} />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Bạn có thể nhập mã thủ công.')
    expect(screen.getByLabelText('Mã')).toHaveAttribute('aria-describedby', 'code-suggestion-error')
    await user.type(screen.getByLabelText('Mã'), 'DN-PN01')
    expect(screen.getByLabelText('Mã')).toHaveValue('DN-PN01')
  })

  it('preserves RHF change, blur, ref/focus, required and maxLength', async () => {
    const user = userEvent.setup()
    const change = vi.fn()
    let form: ReturnType<typeof useForm<{ code: string }>>
    function TestForm() {
      form = useForm({ defaultValues: { code: '' } })
      return (
        <BusinessCodeField
          label="Mã"
          inputProps={{
            ...form.register('code', { onChange: change }),
            id: 'code',
            required: true,
            maxLength: 50,
          }}
        />
      )
    }
    render(<TestForm />)
    const input = screen.getByLabelText('Mã')
    await user.type(input, 'abc001')
    await user.tab()
    expect(form!.getValues('code')).toBe('abc001')
    expect(form!.getFieldState('code').isTouched).toBe(true)
    expect(change).toHaveBeenCalled()
    act(() => form!.setFocus('code'))
    await waitFor(() => expect(input).toHaveFocus())
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('maxlength', '50')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('spellcheck', 'false')
  })

  it.each([{ disabled: true }, { readOnly: true }])(
    'preserves noneditable input attributes (%j)',
    (props) => {
      render(<BusinessCodeField label="Mã" inputProps={{ id: 'code', ...props }} />)
      const input = screen.getByLabelText('Mã')
      if (props.disabled) expect(input).toBeDisabled()
      else expect(input).toHaveAttribute('readonly')
    }
  )
})
