'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface DateRangeFilterProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

interface QuickRangePreset {
  label: string
  getRange: () => DateRange
}

const QUICK_RANGES: QuickRangePreset[] = [
  {
    label: 'Hôm nay',
    getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: '7 ngày qua',
    getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
  },
  {
    label: '30 ngày qua',
    getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }),
  },
  {
    label: 'Tháng này',
    getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Năm nay',
    getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
]

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) return 'Chọn khoảng ngày'
  if (!range.to) return format(range.from, 'dd/MM/yyyy', { locale: vi })
  return `${format(range.from, 'dd/MM/yyyy', { locale: vi })} - ${format(range.to, 'dd/MM/yyyy', { locale: vi })}`
}

function isSameRange(a: DateRange | undefined, b: DateRange | undefined) {
  return a?.from?.getTime() === b?.from?.getTime() && a?.to?.getTime() === b?.to?.getTime()
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<DateRange | undefined>(value)
  const isMobile = useIsMobile()

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setPending(value)
    setOpen(nextOpen)
  }

  function handleApply() {
    onChange(pending)
    setOpen(false)
  }

  function handleCancel() {
    setPending(value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 sm:w-64">
          <CalendarIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{formatRangeLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0" align="end">
        <div className="flex max-w-full flex-col sm:flex-row">
          <div className="border-border grid grid-cols-2 gap-0.5 border-b p-2 sm:flex sm:w-36 sm:shrink-0 sm:flex-col sm:border-r sm:border-b-0">
            {QUICK_RANGES.map((preset) => {
              const presetRange = preset.getRange()
              const isActive = isSameRange(pending, presetRange)

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPending(presetRange)}
                  className={cn(
                    'rounded-none px-2.5 py-1.5 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
          <div className="min-w-0">
            <Calendar
              mode="range"
              selected={pending}
              onSelect={setPending}
              numberOfMonths={isMobile ? 1 : 2}
              locale={vi}
              defaultMonth={pending?.from}
            />
            <div className="border-border flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground min-w-0 text-xs">
                {pending?.from ? `Khoảng: ${formatRangeLabel(pending)}` : 'Chưa chọn khoảng ngày'}
              </span>
              <div className="flex shrink-0 gap-2 sm:justify-end">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleApply} disabled={!pending?.from}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
