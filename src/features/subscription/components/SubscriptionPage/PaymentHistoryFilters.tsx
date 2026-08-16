import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
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
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="payment-search">Mã hóa đơn</FieldLabel>
          <Input
            id="payment-search"
            name="paymentSearch"
            autoComplete="off"
            placeholder="Tìm mã hóa đơn…"
            value={value.searchText}
            onChange={(event) => onChange({ ...value, searchText: event.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="payment-plan">Gói dịch vụ</FieldLabel>
          <Select value={value.planId} onValueChange={(planId) => onChange({ ...value, planId })}>
            <SelectTrigger id="payment-plan" className="w-full">
              <SelectValue placeholder="Tất cả gói" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả gói</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.planName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="payment-status">Trạng thái</FieldLabel>
          <Select
            value={value.status}
            onValueChange={(status) => {
              if (isPaymentStatusFilter(status)) onChange({ ...value, status })
            }}
          >
            <SelectTrigger id="payment-status" className="w-full">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <DatePickerField
          id="payment-date-from"
          label="Từ ngày"
          value={value.dateFrom}
          invalid={Boolean(dateRangeError)}
          onChange={(dateFrom) => onChange({ ...value, dateFrom })}
        />
        <DatePickerField
          id="payment-date-to"
          label="Đến ngày"
          value={value.dateTo}
          invalid={Boolean(dateRangeError)}
          onChange={(dateTo) => onChange({ ...value, dateTo })}
        />
      </FieldGroup>

      {dateRangeError && <FieldError>{dateRangeError}</FieldError>}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          <Search data-icon="inline-start" aria-hidden="true" />
          Lọc
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          aria-label="Đặt lại bộ lọc"
          onClick={onReset}
        >
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Đặt lại
        </Button>
      </div>
    </form>
  )
}

interface DatePickerFieldProps {
  readonly id: string
  readonly label: string
  readonly value?: Date
  readonly invalid: boolean
  readonly onChange: (value?: Date) => void
}

function DatePickerField({ id, label, value, invalid, onChange }: DatePickerFieldProps) {
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 font-normal',
              invalid && 'border-destructive'
            )}
            aria-label={label}
            aria-invalid={invalid}
          >
            <CalendarIcon data-icon="inline-start" aria-hidden="true" />
            {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} locale={vi} />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

function isPaymentStatusFilter(value: string): value is PaymentStatusFilter {
  return statusOptions.some((status) => status.value === value)
}
