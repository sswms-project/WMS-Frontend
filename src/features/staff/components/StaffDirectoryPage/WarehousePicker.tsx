'use client'

import { useState } from 'react'
import { ChevronsUpDown, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { WarehouseSummaryResponse } from '../../types/manager-assignment.types'

interface WarehousePickerProps {
  readonly id?: string
  readonly warehouses: readonly WarehouseSummaryResponse[]
  readonly value?: string
  readonly disabled?: boolean
  readonly invalid?: boolean
  readonly placeholder: string
  readonly onValueChange: (warehouseId?: string) => void
}

export function WarehousePicker({
  id,
  warehouses,
  value,
  disabled = false,
  invalid = false,
  placeholder,
  onValueChange,
}: WarehousePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedWarehouse = warehouses.find((warehouse) => warehouse.id === value)

  function selectWarehouse(warehouseId?: string) {
    onValueChange(warehouseId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className="h-11 w-full justify-between px-3 font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Warehouse className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            {selectedWarehouse ? (
              <span className="min-w-0 truncate text-left">
                <span className="font-medium">{selectedWarehouse.warehouseCode}</span>
                <span className="text-muted-foreground"> · {selectedWarehouse.warehouseName}</span>
              </span>
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] gap-0 p-0">
        <Command>
          <CommandInput placeholder="Tìm theo tên hoặc mã kho" />
          <CommandList>
            <CommandEmpty>Không tìm thấy kho phù hợp.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="khong gan kho"
                data-checked={!value}
                onSelect={() => selectWarehouse()}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="bg-muted flex size-7 shrink-0 items-center justify-center">
                    <Warehouse className="text-muted-foreground size-3.5" aria-hidden="true" />
                  </span>
                  <span>Chưa gán kho</span>
                </span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Kho đang hoạt động">
              {warehouses.map((warehouse) => (
                <CommandItem
                  key={warehouse.id}
                  value={`${warehouse.warehouseCode} ${warehouse.warehouseName} ${warehouse.address ?? ''}`}
                  data-checked={value === warehouse.id}
                  onSelect={() => selectWarehouse(warehouse.id)}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="bg-primary/10 text-primary flex h-7 min-w-12 shrink-0 items-center justify-center px-1.5 text-[11px] font-semibold">
                      {warehouse.warehouseCode}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">
                        {warehouse.warehouseName}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block truncate text-[11px]">
                        {warehouse.address || 'Chưa cập nhật địa chỉ'}
                      </span>
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
