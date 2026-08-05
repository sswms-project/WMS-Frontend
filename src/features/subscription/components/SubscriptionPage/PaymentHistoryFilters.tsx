import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  PaymentHistoryFilterState,
  PaymentStatusFilter,
  SubscriptionPlanResponse,
} from '../../types/subscription.types'

const statusOptions: readonly { readonly value: PaymentStatusFilter; readonly label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Completed', label: 'Đã thanh toán' },
  { value: 'Pending', label: 'Đang xử lý' },
  { value: 'Failed', label: 'Thất bại' },
]

interface PaymentHistoryFiltersProps {
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly value: PaymentHistoryFilterState
  readonly dateRangeError?: string
  readonly onChange: (value: PaymentHistoryFilterState) => void
  readonly onSubmit: () => void
  readonly onReset: () => void
}

export function PaymentHistoryFilters({
  plans,
  value,
  dateRangeError,
  onChange,
  onSubmit,
  onReset,
}: PaymentHistoryFiltersProps) {
  return (
    <form
      className="grid min-w-0 gap-3 lg:grid-cols-[minmax(180px,1fr)_180px_180px_180px_auto_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="min-w-0 space-y-1.5">
        <Label htmlFor="payment-search">Mã hóa đơn</Label>
        <Input
          id="payment-search"
          value={value.searchText}
          placeholder="Tìm mã hóa đơn"
          onChange={(event) => onChange({ ...value, searchText: event.target.value })}
        />
      </div>
      <div className="min-w-0 space-y-1.5">
        <Label>Gói dịch vụ</Label>
        <Select value={value.planId} onValueChange={(planId) => onChange({ ...value, planId })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả gói" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả gói</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.planName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0 space-y-1.5">
        <Label>Trạng thái</Label>
        <Select
          value={value.status}
          onValueChange={(status) => {
            if (isPaymentStatusFilter(status)) onChange({ ...value, status })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DatePickerField
        label="Từ ngày"
        value={value.dateFrom}
        invalid={Boolean(dateRangeError)}
        onChange={(dateFrom) => onChange({ ...value, dateFrom })}
      />
      <DatePickerField
        label="Đến ngày"
        value={value.dateTo}
        invalid={Boolean(dateRangeError)}
        onChange={(dateTo) => onChange({ ...value, dateTo })}
      />
      <div className="flex items-end gap-2">
        <Button type="submit" className="min-w-24">
          <Search className="size-4" aria-hidden="true" />
          Lọc
        </Button>
        <Button type="button" variant="outline" aria-label="Đặt lại bộ lọc" onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {dateRangeError && (
        <p className="text-destructive text-sm lg:col-span-full">{dateRangeError}</p>
      )}
    </form>
  )
}

interface DatePickerFieldProps {
  readonly label: string
  readonly value?: Date
  readonly invalid: boolean
  readonly onChange: (value?: Date) => void
}

function DatePickerField({ label, value, invalid, onChange }: DatePickerFieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 font-normal',
              invalid && 'border-destructive text-destructive'
            )}
            aria-invalid={invalid}
          >
            <CalendarIcon className="size-4" aria-hidden="true" />
            {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} locale={vi} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function isPaymentStatusFilter(value: string): value is PaymentStatusFilter {
  return statusOptions.some((status) => status.value === value)
}
