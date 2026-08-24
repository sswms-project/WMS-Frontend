'use client'

import { useMemo, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Spinner } from '@/components/ui/spinner'

export interface LookupOption {
  value: string
  label: string
}

interface LookupComboboxProps {
  readonly id?: string
  readonly value: string
  readonly options: readonly LookupOption[]
  readonly placeholder: string
  readonly emptyMessage: string
  readonly ariaLabel: string
  readonly isLoading: boolean
  readonly isInvalid: boolean
  readonly onChange: (value: string) => void
  readonly onSearchChange: (value: string) => void
}

export function LookupCombobox({
  id,
  value,
  options,
  placeholder,
  emptyMessage,
  ariaLabel,
  isLoading,
  isInvalid,
  onChange,
  onSearchChange,
}: LookupComboboxProps) {
  const optionLabels = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options]
  )
  const [selectedLabel, setSelectedLabel] = useState('')
  const itemValues = options.map((option) => option.value)

  return (
    <Combobox
      items={itemValues}
      value={value || null}
      filter={null}
      itemToStringLabel={(itemValue: string) =>
        optionLabels.get(itemValue) ?? (itemValue === value ? selectedLabel : itemValue)
      }
      onValueChange={(nextValue) => {
        if (nextValue) setSelectedLabel(optionLabels.get(nextValue) ?? nextValue)
        onChange(nextValue ?? '')
      }}
      onInputValueChange={(nextSearchValue, details) => {
        if (details.reason !== 'item-press') onSearchChange(nextSearchValue)
      }}
    >
      <ComboboxInput
        id={id}
        className="w-full"
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={isInvalid}
        showClear={Boolean(value)}
      />
      <ComboboxContent sideOffset={4} align="start">
        <ComboboxList>
          <ComboboxGroup>
            {itemValues.map((itemValue) => (
              <ComboboxItem key={itemValue} value={itemValue}>
                {optionLabels.get(itemValue)}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          <ComboboxEmpty>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> Đang tìm kiếm
              </span>
            ) : (
              emptyMessage
            )}
          </ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
