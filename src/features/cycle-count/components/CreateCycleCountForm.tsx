'use client'

import Link from 'next/link'
import { ArrowLeft, ClipboardPlus, LockKeyhole } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { APP_ROUTES } from '@/routes/app-routes'
import type { InventoryBalance } from '@/features/inventory/types/inventory.types'
import type { CreateCycleCountFormValues } from '../schemas/cycle-count.schema'

interface Props {
  readonly form: UseFormReturn<CreateCycleCountFormValues>
  readonly warehouses: readonly { value: string; label: string }[]
  readonly zones: readonly { value: string; label: string }[]
  readonly staff: readonly { value: string; label: string }[]
  readonly inventory: readonly InventoryBalance[]
  readonly inventoryPage: number
  readonly inventoryPageSize: number
  readonly inventoryTotalCount: number
  readonly isInventoryLoading: boolean
  readonly isPending: boolean
  readonly onSubmit: (values: CreateCycleCountFormValues) => Promise<void>
  readonly onInventoryPageChange: (page: number) => void
}

export function CreateCycleCountForm({
  form,
  warehouses,
  zones,
  staff,
  inventory,
  inventoryPage,
  inventoryPageSize,
  inventoryTotalCount,
  isInventoryLoading,
  isPending,
  onSubmit,
  onInventoryPageChange,
}: Props) {
  const selectedItems = form.watch('items')
  const warehouseId = form.watch('warehouseId')
  const isBlindCount = form.watch('isBlindCount')
  const itemError = form.formState.errors.items
  function toggleItem(item: InventoryBalance, checked: boolean) {
    const next = checked
      ? [...selectedItems, { productId: item.productId, slotId: item.slotId }]
      : selectedItems.filter(
          (selected) => selected.productId !== item.productId || selected.slotId !== item.slotId
        )
    form.setValue('items', next, { shouldDirty: true, shouldValidate: true })
  }
  return (
    <form
      className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <header className="flex shrink-0 items-start gap-3 border-b pb-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={APP_ROUTES.cycleCounts} aria-label="Quay lại">
            <ArrowLeft />
          </Link>
        </Button>
        <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
          <ClipboardPlus />
        </span>
        <div>
          <p className="text-primary text-xs font-medium">Kiểm kê</p>
          <h1 className="text-xl font-semibold">Tạo phiếu kiểm kê</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Phân công các vị trí tồn kho cần kiểm đếm thực tế.
          </p>
        </div>
      </header>
      <section className="bg-card grid shrink-0 gap-4 border p-4 md:grid-cols-2 lg:grid-cols-4">
        <Field data-invalid={Boolean(form.formState.errors.warehouseId)}>
          <FieldLabel htmlFor="warehouseId">Kho</FieldLabel>
          <NativeSelect
            id="warehouseId"
            {...form.register('warehouseId', {
              onChange: () => {
                onInventoryPageChange(1)
                form.setValue('zoneId', '')
                form.setValue('assignedTo', '')
                form.setValue('items', [], { shouldValidate: true })
              },
            })}
          >
            <NativeSelectOption value="">Chọn kho</NativeSelectOption>
            {warehouses.map((o) => (
              <NativeSelectOption key={o.value} value={o.value}>
                {o.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError
            errors={
              form.formState.errors.warehouseId ? [form.formState.errors.warehouseId] : undefined
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="zoneId">Khu vực</FieldLabel>
          <NativeSelect
            id="zoneId"
            disabled={!warehouseId}
            {...form.register('zoneId', {
              onChange: () => {
                onInventoryPageChange(1)
                form.setValue('items', [], { shouldValidate: true })
              },
            })}
          >
            <NativeSelectOption value="">Toàn kho</NativeSelectOption>
            {zones.map((o) => (
              <NativeSelectOption key={o.value} value={o.value}>
                {o.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.assignedTo)}>
          <FieldLabel htmlFor="assignedTo">Nhân viên phụ trách</FieldLabel>
          <NativeSelect id="assignedTo" disabled={!warehouseId} {...form.register('assignedTo')}>
            <NativeSelectOption value="">Chọn nhân viên</NativeSelectOption>
            {staff.map((o) => (
              <NativeSelectOption key={o.value} value={o.value}>
                {o.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError
            errors={
              form.formState.errors.assignedTo ? [form.formState.errors.assignedTo] : undefined
            }
          />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.scheduledDate)}>
          <FieldLabel htmlFor="scheduledDate">Thời gian dự kiến</FieldLabel>
          <Input id="scheduledDate" type="datetime-local" {...form.register('scheduledDate')} />
          <FieldError
            errors={
              form.formState.errors.scheduledDate
                ? [form.formState.errors.scheduledDate]
                : undefined
            }
          />
        </Field>
        <div className="flex items-center justify-between gap-3 border p-3 md:col-span-2 lg:col-span-4">
          <div className="flex items-start gap-2">
            <LockKeyhole className="text-primary mt-0.5 size-4" />
            <div>
              <p className="text-sm font-medium">Blind count</p>
              <p className="text-muted-foreground text-xs">
                Ẩn tồn hệ thống với Staff trước khi gửi kết quả, giảm thiên lệch khi đếm.
              </p>
            </div>
          </div>
          <Switch
            checked={isBlindCount}
            onCheckedChange={(checked) =>
              form.setValue('isBlindCount', checked, { shouldDirty: true })
            }
            aria-label="Bật blind count"
          />
        </div>
      </section>
      <section className="bg-card flex min-h-0 flex-1 flex-col border">
        <div className="flex items-center justify-between border-b p-3">
          <div>
            <h2 className="text-sm font-semibold">Vị trí cần kiểm đếm</h2>
            <p className="text-muted-foreground text-xs">
              Đã chọn {selectedItems.length} dòng tồn kho.
            </p>
          </div>
          {itemError ? <p className="text-destructive text-xs">{itemError.message}</p> : null}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-card sticky top-0 w-12">
                  <span className="sr-only">Chọn</span>
                </TableHead>
                <TableHead className="bg-card sticky top-0">Sản phẩm</TableHead>
                <TableHead className="bg-card sticky top-0">Vị trí</TableHead>
                <TableHead className="bg-card sticky top-0 text-right">Tồn hiện tại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInventoryLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground h-32 text-center">
                    Đang tải tồn kho...
                  </TableCell>
                </TableRow>
              ) : !warehouseId ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground h-32 text-center">
                    Chọn kho để xem các vị trí có tồn.
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground h-32 text-center">
                    Không có tồn kho phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => {
                  const checked = selectedItems.some(
                    (selected) =>
                      selected.productId === item.productId && selected.slotId === item.slotId
                  )
                  return (
                    <TableRow key={item.id} data-state={checked ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => toggleItem(item, value === true)}
                          aria-label={`Chọn ${item.productName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-muted-foreground font-mono text-xs">{item.sku}</p>
                      </TableCell>
                      <TableCell className="font-mono">{item.slotCode}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {item.quantityOnHand}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        <OperationalPagination
          page={inventoryPage}
          pageSize={inventoryPageSize}
          totalCount={inventoryTotalCount}
          isPending={isInventoryLoading}
          onPageChange={onInventoryPageChange}
        />
      </section>
      <footer className="flex shrink-0 justify-end gap-2 border-t pt-4">
        <Button asChild variant="outline">
          <Link href={APP_ROUTES.cycleCounts}>Hủy</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Đang tạo...' : 'Tạo phiếu kiểm kê'}
        </Button>
      </footer>
    </form>
  )
}
