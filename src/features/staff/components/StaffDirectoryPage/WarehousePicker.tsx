'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WarehouseSummaryResponse } from '../../types/manager-assignment.types'

interface WarehousePickerProps {
  readonly id?: string
  readonly warehouses: readonly WarehouseSummaryResponse[]
  readonly value?: string
  readonly invalid?: boolean
  readonly disabled?: boolean
  readonly placeholder?: string
  readonly onValueChange: (value: string) => void
}

export function WarehousePicker({
  id,
  warehouses,
  value,
  invalid,
  disabled,
  placeholder = 'Chọn kho',
  onValueChange,
}: WarehousePickerProps) {
  return (
    <Select value={value} disabled={disabled} onValueChange={onValueChange}>
      <SelectTrigger id={id} aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start">
        {warehouses.map((warehouse) => (
          <SelectItem key={warehouse.id} value={warehouse.id}>
            {warehouse.warehouseCode} — {warehouse.warehouseName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
