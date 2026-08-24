import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { InventoryFilterOption, StockMovementType } from '../../types/inventory.types'
import { STOCK_MOVEMENT_TYPES } from '../../types/inventory.types'

interface StockMovementFiltersProps {
  readonly open: boolean
  readonly productId: string
  readonly movementType: StockMovementType | ''
  readonly dateFrom: string
  readonly dateTo: string
  readonly productOptions: readonly InventoryFilterOption[]
  readonly isDateRangeValid: boolean
  readonly areProductsLoading: boolean
  readonly areProductsError: boolean
  readonly activeFilterCount: number
  readonly onOpenChange: (open: boolean) => void
  readonly onProductChange: (value: string) => void
  readonly onMovementTypeChange: (value: StockMovementType | '') => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onResetFilters: () => void
  readonly onRetryProducts: () => void
}

const movementOptions = [
  { value: STOCK_MOVEMENT_TYPES.inbound, label: 'Nhập kho' },
  { value: STOCK_MOVEMENT_TYPES.outbound, label: 'Xuất kho' },
  { value: STOCK_MOVEMENT_TYPES.transfer, label: 'Chuyển kho' },
  { value: STOCK_MOVEMENT_TYPES.adjustment, label: 'Điều chỉnh' },
  { value: STOCK_MOVEMENT_TYPES.return, label: 'Trả hàng' },
] as const

export function StockMovementFilters({
  open,
  productId,
  movementType,
  dateFrom,
  dateTo,
  productOptions,
  isDateRangeValid,
  areProductsLoading,
  areProductsError,
  activeFilterCount,
  onOpenChange,
  onProductChange,
  onMovementTypeChange,
  onDateFromChange,
  onDateToChange,
  onResetFilters,
  onRetryProducts,
}: StockMovementFiltersProps) {
  function handleMovementTypeChange(value: string) {
    onMovementTypeChange(movementOptions.find((option) => option.value === value)?.value ?? '')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Lọc lịch sử biến động</SheetTitle>
          <SheetDescription>
            Thu hẹp dữ liệu theo sản phẩm, nghiệp vụ hoặc thời gian.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup className="flex-1 p-4">
          {areProductsError ? (
            <div
              className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 border p-3"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium">Không thể tải danh sách sản phẩm</p>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={onRetryProducts}
                >
                  Thử tải lại
                </Button>
              </div>
            </div>
          ) : null}
          <Field>
            <FieldLabel htmlFor="movement-product">Sản phẩm</FieldLabel>
            <NativeSelect
              id="movement-product"
              className="h-11 sm:h-8"
              value={productId}
              disabled={areProductsLoading}
              onChange={(event) => onProductChange(event.target.value)}
            >
              <NativeSelectOption value="">Tất cả sản phẩm</NativeSelectOption>
              {productOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="movement-type">Loại biến động</FieldLabel>
            <NativeSelect
              id="movement-type"
              className="h-11 sm:h-8"
              value={movementType}
              onChange={(event) => handleMovementTypeChange(event.target.value)}
            >
              <NativeSelectOption value="">Tất cả loại</NativeSelectOption>
              {movementOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="movement-date-from">Từ ngày</FieldLabel>
              <Input
                id="movement-date-from"
                type="date"
                className="h-11 sm:h-8"
                value={dateFrom}
                max={dateTo || undefined}
                aria-invalid={!isDateRangeValid}
                onChange={(event) => onDateFromChange(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="movement-date-to">Đến ngày</FieldLabel>
              <Input
                id="movement-date-to"
                type="date"
                className="h-11 sm:h-8"
                value={dateTo}
                min={dateFrom || undefined}
                aria-invalid={!isDateRangeValid}
                onChange={(event) => onDateToChange(event.target.value)}
              />
            </Field>
          </div>
          {!isDateRangeValid ? (
            <p className="text-destructive text-xs" role="alert">
              Ngày bắt đầu không được sau ngày kết thúc.
            </p>
          ) : null}
        </FieldGroup>
        <SheetFooter>
          <Button type="button" disabled={!isDateRangeValid} onClick={() => onOpenChange(false)}>
            Xem kết quả
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={activeFilterCount === 0}
            onClick={onResetFilters}
          >
            Đặt lại
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
