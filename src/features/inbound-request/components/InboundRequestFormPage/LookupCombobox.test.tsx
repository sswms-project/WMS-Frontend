import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LookupCombobox, type LookupOption } from './LookupCombobox'

const products: readonly LookupOption[] = [
  { value: 'product-1', label: 'SP-001 - Bàn phím cơ' },
  { value: 'product-2', label: 'SP-002 - Chuột không dây' },
]

function ControlledLookup({
  options,
  onChange,
  onSearchChange,
}: {
  readonly options: readonly LookupOption[]
  readonly onChange: (value: string) => void
  readonly onSearchChange: (value: string) => void
}) {
  const [value, setValue] = useState('')

  return (
    <LookupCombobox
      value={value}
      options={options}
      placeholder="Chọn hoặc tìm sản phẩm"
      emptyMessage="Không tìm thấy sản phẩm phù hợp."
      ariaLabel="Sản phẩm dòng 1"
      isLoading={false}
      isInvalid={false}
      onChange={(nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      }}
      onSearchChange={onSearchChange}
    />
  )
}

function MirroredLookup({ options }: { readonly options: readonly LookupOption[] }) {
  const [value, setValue] = useState('')
  const [selectedOption, setSelectedOption] = useState<LookupOption>()

  return (
    <>
      {['desktop', 'mobile'].map((viewport) => (
        <LookupCombobox
          key={viewport}
          value={value}
          options={options}
          selectedOption={selectedOption}
          placeholder="Chọn hoặc tìm sản phẩm"
          emptyMessage="Không tìm thấy sản phẩm phù hợp."
          ariaLabel={`Sản phẩm ${viewport}`}
          isLoading={false}
          isInvalid={false}
          onChange={(nextValue, option) => {
            setValue(nextValue)
            setSelectedOption(option)
          }}
          onSearchChange={vi.fn()}
        />
      ))}
    </>
  )
}

describe('LookupCombobox', () => {
  it('retains the selected label when an async result window no longer contains it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSearchChange = vi.fn()
    const { rerender } = render(
      <ControlledLookup options={products} onChange={onChange} onSearchChange={onSearchChange} />
    )

    await user.click(screen.getByRole('combobox', { name: 'Sản phẩm dòng 1' }))
    await user.click(screen.getByRole('option', { name: 'SP-001 - Bàn phím cơ' }))

    expect(screen.getByRole('combobox', { name: 'Sản phẩm dòng 1' })).toHaveValue(
      'SP-001 - Bàn phím cơ'
    )
    expect(onChange).toHaveBeenLastCalledWith('product-1')

    onChange.mockClear()
    onSearchChange.mockClear()
    rerender(
      <ControlledLookup
        options={products.slice(1)}
        onChange={onChange}
        onSearchChange={onSearchChange}
      />
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Sản phẩm dòng 1' })).toHaveValue(
        'SP-001 - Bàn phím cơ'
      )
    )
    expect(onChange).not.toHaveBeenCalled()
    expect(onSearchChange).not.toHaveBeenCalled()
  })

  it('forwards only user-entered text to remote search', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()

    render(
      <ControlledLookup options={products} onChange={vi.fn()} onSearchChange={onSearchChange} />
    )

    const input = screen.getByRole('combobox', { name: 'Sản phẩm dòng 1' })
    await user.click(input)
    await user.type(input, 'Chuột')

    expect(onSearchChange).toHaveBeenLastCalledWith('Chuột')
  })

  it('keeps responsive copies synchronized when search results change', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MirroredLookup options={products} />)

    await user.click(screen.getByRole('combobox', { name: 'Sản phẩm desktop' }))
    await user.click(screen.getByRole('option', { name: 'SP-001 - Bàn phím cơ' }))
    rerender(<MirroredLookup options={products.slice(1)} />)

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Sản phẩm desktop' })).toHaveValue(
        'SP-001 - Bàn phím cơ'
      )
      expect(screen.getByRole('combobox', { name: 'Sản phẩm mobile' })).toHaveValue(
        'SP-001 - Bàn phím cơ'
      )
    })
  })
})
