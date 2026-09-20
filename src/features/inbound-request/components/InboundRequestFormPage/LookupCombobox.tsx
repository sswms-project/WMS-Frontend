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
  readonly selectedOption?: LookupOption
  readonly placeholder: string
  readonly emptyMessage: string
  readonly ariaLabel: string
  readonly isLoading: boolean
  readonly isInvalid: boolean
  readonly onChange: (value: string, option?: LookupOption) => void
  readonly onSearchChange: (value: string) => void
}

export function LookupCombobox({
  id,
  value,
  options,
  selectedOption,
  placeholder,
  emptyMessage,
  ariaLabel,
  isLoading,
  isInvalid,
  onChange,
  onSearchChange,
}: LookupComboboxProps) {
  const [rememberedOption, setRememberedOption] = useState<LookupOption | undefined>(
    () => selectedOption ?? options.find((option) => option.value === value)
  )
  const resolvedSelectedOption = value
    ? (options.find((option) => option.value === value) ??
      (selectedOption?.value === value ? selectedOption : undefined) ??
      (rememberedOption?.value === value ? rememberedOption : undefined))
    : undefined
  const optionLabels = useMemo(() => {
    const labels = new Map(options.map((option) => [option.value, option.label]))
    if (resolvedSelectedOption && !labels.has(resolvedSelectedOption.value)) {
      labels.set(resolvedSelectedOption.value, resolvedSelectedOption.label)
    }
    return labels
  }, [options, resolvedSelectedOption])
  const itemValues = useMemo(() => Array.from(optionLabels.keys()), [optionLabels])
  const filteredItemValues = useMemo(() => options.map((option) => option.value), [options])

  return (
    <Combobox
      items={itemValues}
      filteredItems={filteredItemValues}
      value={value || null}
      filter={null}
      itemToStringLabel={(itemValue: string) => optionLabels.get(itemValue) ?? itemValue}
      onValueChange={(nextValue, details) => {
        const nextOption = nextValue
          ? options.find((option) => option.value === nextValue)
          : undefined
        setRememberedOption(nextOption)
        onChange(nextValue ?? '', nextOption)
        if (details.reason === 'item-press' || details.reason === 'clear-press') {
          onSearchChange('')
        }
      }}
      onInputValueChange={(nextSearchValue, details) => {
        if (details.reason === 'input-change') onSearchChange(nextSearchValue)
      }}
      onOpenChange={(open) => {
        if (!open) onSearchChange('')
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
            {filteredItemValues.map((itemValue) => (
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
