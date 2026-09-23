'use client'

import { useState } from 'react'
import { Pencil, Plus, Power, RotateCcw, Scale } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { StatusChangeDialog } from '@/components/operations/StatusChangeDialog'
import type { UnitFormValues } from '../../schemas/master-data.schema'
import type { UnitResponse } from '../../types/product.types'

interface UnitCatalogProps {
  readonly items: readonly UnitResponse[]
  readonly editingUnit: UnitResponse | null
  readonly form: UseFormReturn<UnitFormValues>
  readonly isFormOpen: boolean
  readonly canManage: boolean
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isPending: boolean
  readonly onRetry: () => void
  readonly onCreate: () => void
  readonly onEdit: (unit: UnitResponse) => void
  readonly onFormOpenChange: (open: boolean) => void
  readonly onSubmit: (values: UnitFormValues) => void
  readonly onChangeStatus: (unit: UnitResponse) => void
}

export function UnitCatalog({
  items,
  editingUnit,
  form,
  isFormOpen,
  canManage,
  isLoading,
  isError,
  isPending,
  onRetry,
  onCreate,
  onEdit,
  onFormOpenChange,
  onSubmit,
  onChangeStatus,
}: UnitCatalogProps) {
  const [statusTarget, setStatusTarget] = useState<UnitResponse | null>(null)
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <Scale aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Danh mục</p>
            <h1 className="text-xl font-semibold">Đơn vị tính</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý đơn vị cơ sở và độ chính xác số lượng trong phạm vi đơn vị thuê.
            </p>
          </div>
        </div>
        {canManage ? (
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Thêm đơn vị tính
          </Button>
        ) : null}
      </header>

      <section
        className="bg-card min-h-0 flex-1 overflow-auto border"
        aria-label="Danh sách đơn vị tính"
      >
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải đơn vị tính" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có đơn vị tính"
            description="Thêm đơn vị tính đầu tiên để sử dụng khi tạo sản phẩm."
          />
        ) : (
          <Table>
            <TableHeader className="bg-card sticky top-0 z-10">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên đơn vị</TableHead>
                <TableHead>Ký hiệu</TableHead>
                <TableHead>Số chữ số thập phân</TableHead>
                <TableHead>Trạng thái</TableHead>
                {canManage ? <TableHead className="text-right">Thao tác</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-mono font-medium">{unit.unitCode}</TableCell>
                  <TableCell>{unit.unitName}</TableCell>
                  <TableCell>{unit.symbol ?? '—'}</TableCell>
                  <TableCell>{unit.quantityPrecision}</TableCell>
                  <TableCell>
                    <Badge variant={unit.status === 'Active' ? 'default' : 'outline'}>
                      {unit.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={unit.status !== 'Active'}
                          onClick={() => onEdit(unit)}
                        >
                          <Pencil data-icon="inline-start" aria-hidden="true" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setStatusTarget(unit)}
                        >
                          {unit.status === 'Active' ? (
                            <Power data-icon="inline-start" aria-hidden="true" />
                          ) : (
                            <RotateCcw data-icon="inline-start" aria-hidden="true" />
                          )}
                          {unit.status === 'Active' ? 'Ngừng' : 'Kích hoạt'}
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Dialog open={isFormOpen} onOpenChange={onFormOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Chỉnh sửa đơn vị tính' : 'Thêm đơn vị tính'}</DialogTitle>
            <DialogDescription>
              Số chữ số thập phân quyết định độ chính xác cho số lượng theo đơn vị này.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(form.formState.errors.unitCode)}>
                <FieldLabel htmlFor="unitCode">Mã đơn vị</FieldLabel>
                <Input id="unitCode" autoComplete="off" {...form.register('unitCode')} />
                <FieldError
                  errors={
                    form.formState.errors.unitCode ? [form.formState.errors.unitCode] : undefined
                  }
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.unitName)}>
                <FieldLabel htmlFor="unitName">Tên đơn vị</FieldLabel>
                <Input id="unitName" autoComplete="off" {...form.register('unitName')} />
                <FieldError
                  errors={
                    form.formState.errors.unitName ? [form.formState.errors.unitName] : undefined
                  }
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.symbol)}>
                <FieldLabel htmlFor="unitSymbol">Ký hiệu</FieldLabel>
                <Input id="unitSymbol" autoComplete="off" {...form.register('symbol')} />
                <FieldError
                  errors={form.formState.errors.symbol ? [form.formState.errors.symbol] : undefined}
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.quantityPrecision)}>
                <FieldLabel htmlFor="quantityPrecision">Số chữ số thập phân</FieldLabel>
                <Input
                  id="quantityPrecision"
                  type="number"
                  min={0}
                  max={6}
                  {...form.register('quantityPrecision', { valueAsNumber: true })}
                />
                <FieldError
                  errors={
                    form.formState.errors.quantityPrecision
                      ? [form.formState.errors.quantityPrecision]
                      : undefined
                  }
                />
              </Field>
              <Field
                className="sm:col-span-2"
                data-invalid={Boolean(form.formState.errors.description)}
              >
                <FieldLabel htmlFor="unitDescription">Mô tả</FieldLabel>
                <Textarea
                  id="unitDescription"
                  rows={3}
                  autoComplete="off"
                  {...form.register('description')}
                />
                <FieldError
                  errors={
                    form.formState.errors.description
                      ? [form.formState.errors.description]
                      : undefined
                  }
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => onFormOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang lưu…' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <StatusChangeDialog
        open={Boolean(statusTarget)}
        subject={`đơn vị tính “${statusTarget?.unitName ?? ''}”`}
        nextStatus={statusTarget?.status === 'Active' ? 'Inactive' : 'Active'}
        isPending={isPending}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        onConfirm={() => {
          if (!statusTarget) return
          onChangeStatus(statusTarget)
          setStatusTarget(null)
        }}
      />
    </div>
  )
}
