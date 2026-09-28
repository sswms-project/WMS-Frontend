'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { format, isValid, parseISO } from 'date-fns'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangeFilter } from '@/features/dashboard/components/shared'
import { AUDIT_LOG_TIME_RANGES, type AuditLogTimeRange } from '../../types/platform-services.types'
import type { AuditLogFilterValues } from './types'

const TIME_RANGE_OPTIONS: ReadonlyArray<{ value: AuditLogTimeRange; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'this-week', label: 'Tuần này' },
  { value: 'week-to-date', label: 'Từ đầu tuần đến nay' },
  { value: 'this-month', label: 'Tháng này' },
  { value: 'month-to-date', label: 'Từ đầu tháng đến nay' },
  { value: 'this-quarter', label: 'Quý này' },
  { value: 'quarter-to-date', label: 'Từ đầu quý đến nay' },
  { value: 'this-year', label: 'Năm nay' },
  { value: 'year-to-date', label: 'Từ đầu năm đến nay' },
  { value: 'custom', label: 'Tùy chọn' },
]

interface AuditLogFiltersProps {
  readonly filters: AuditLogFilterValues
  readonly onApply: (filters: AuditLogFilterValues) => void
  readonly onClear: () => void
}

export function AuditLogFilters({ filters, onApply, onClear }: AuditLogFiltersProps) {
  const [timeRange, setTimeRange] = useState<AuditLogTimeRange>(filters.timeRange)
  const [customRange, setCustomRange] = useState<DateRange | undefined>(() =>
    createCustomRange(filters.dateFrom, filters.dateTo)
  )

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onApply({
          search: String(data.get('search') ?? ''),
          timeRange,
          dateFrom: timeRange === 'custom' ? formatRangeDate(customRange?.from) : '',
          dateTo:
            timeRange === 'custom' ? formatRangeDate(customRange?.to ?? customRange?.from) : '',
        })
      }}
    >
      <InputGroup className="w-full sm:w-72 lg:w-96">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          name="search"
          defaultValue={filters.search}
          placeholder="Tìm người dùng, hành động hoặc tham chiếu…"
          aria-label="Tìm nhật ký hoạt động"
          autoComplete="off"
        />
      </InputGroup>
      <Select
        value={timeRange}
        onValueChange={(value) =>
          setTimeRange(AUDIT_LOG_TIME_RANGES.find((item) => item === value) ?? 'this-week')
        }
      >
        <SelectTrigger className="w-48" aria-label="Khoảng thời gian">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" position="popper" sideOffset={4}>
          <SelectGroup>
            {TIME_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {timeRange === 'custom' ? (
        <DateRangeFilter value={customRange} onChange={setCustomRange} />
      ) : null}
      <Button type="submit" variant="outline">
        Tìm kiếm
      </Button>
      {filters.search || filters.timeRange !== 'this-week' ? (
        <Button type="button" variant="ghost" onClick={onClear}>
          <X data-icon="inline-start" aria-hidden="true" />
          Xóa lọc
        </Button>
      ) : null}
    </form>
  )
}

function createCustomRange(dateFrom: string, dateTo: string): DateRange | undefined {
  if (!dateFrom) return undefined
  const from = parseISO(dateFrom)
  if (!isValid(from)) return undefined
  const to = dateTo ? parseISO(dateTo) : undefined
  return { from, to: to && isValid(to) ? to : undefined }
}

function formatRangeDate(date: Date | undefined) {
  return date ? format(date, 'yyyy-MM-dd') : ''
}
