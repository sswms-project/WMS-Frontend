'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WarehouseStats } from '../../types'

export const ALL_WAREHOUSES_VALUE = 'all'

interface WarehouseFilterProps {
  warehouses: WarehouseStats[]
  value: string
  onChange: (value: string) => void
}

export function WarehouseFilter({ warehouses, value, onChange }: WarehouseFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-56" size="default">
        <SelectValue placeholder="Chọn kho" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_WAREHOUSES_VALUE}>Tất cả các kho</SelectItem>
        {warehouses.map((warehouse) => (
          <SelectItem key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
