'use client'

import { useState } from 'react'
import { Calculator, Pencil, Plus, Power, RotateCcw } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
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
import type { ProductUnitConversionFormValues } from '../../schemas/master-data.schema'
import type { ProductUnitConversion, UnitResponse } from '../../types/product.types'

interface ProductUnitConversionsPanelProps {
  readonly baseUnitName: string
  readonly conversions: readonly ProductUnitConversion[]
  readonly units: readonly UnitResponse[]
  readonly editingConversion: ProductUnitConversion | null
  readonly form: UseFormReturn<ProductUnitConversionFormValues>
  readonly isDialogOpen: boolean
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isPending: boolean
  readonly canManage: boolean
  readonly onRetry: () => void
  readonly onCreate: () => void
  readonly onEdit: (conversion: ProductUnitConversion) => void
  readonly onDialogOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ProductUnitConversionFormValues) => void
  readonly onChangeStatus: (conversion: ProductUnitConversion) => void
}

export function ProductUnitConversionsPanel({
  baseUnitName,
  conversions,
  units,
  editingConversion,
  form,
  isDialogOpen,
  isLoading,
  isError,
  isPending,
  canManage,
  onRetry,
  onCreate,
  onEdit,
  onDialogOpenChange,
  onSubmit,
  onChangeStatus,
}: ProductUnitConversionsPanelProps) {
  const [statusTarget, setStatusTarget] = useState<ProductUnitConversion | null>(null)
  const selectedUnit = units.find((unit) => unit.id === form.watch('unitId'))
  const factor = form.watch('conversionFactor')

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Quy đổi đơn vị</CardTitle>
          <CardDescription>
            Đơn vị cơ sở: {baseUnitName}. Mỗi hệ số quy đổi trực tiếp về đơn vị cơ sở.
          </CardDescription>
        </div>
        {canManage ? (
          <Button size="sm" onClick={onCreate}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Thêm quy đổi
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải quy đổi đơn vị" onRetry={onRetry} />
        ) : conversions.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có quy đổi đơn vị"
            description="Sản phẩm hiện chỉ sử dụng đơn vị cơ sở."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn vị thay thế</TableHead>
                <TableHead>Quy đổi</TableHead>
                <TableHead>Trạng thái</TableHead>
                {canManage ? <TableHead className="text-right">Thao tác</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversions.map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell className="font-medium">
                    {conversion.unitName}{' '}
                    {conversion.unitSymbol ? `(${conversion.unitSymbol})` : ''}
                  </TableCell>
                  <TableCell>
                    1 {conversion.unitName} = {conversion.conversionFactor} {baseUnitName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conversion.status === 'Active' ? 'default' : 'outline'}>
                      {conversion.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={conversion.status !== 'Active'}
                          onClick={() => onEdit(conversion)}
                        >
                          <Pencil data-icon="inline-start" aria-hidden="true" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setStatusTarget(conversion)}
                        >
                          {conversion.status === 'Active' ? (
                            <Power data-icon="inline-start" aria-hidden="true" />
                          ) : (
                            <RotateCcw data-icon="inline-start" aria-hidden="true" />
                          )}
                          {conversion.status === 'Active' ? 'Ngừng' : 'Kích hoạt'}
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConversion ? 'Chỉnh sửa quy đổi' : 'Thêm quy đổi đơn vị'}
            </DialogTitle>
            <DialogDescription>
              Hệ số mới chỉ áp dụng cho giao dịch tạo sau khi lưu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.unitId)}>
                <FieldLabel htmlFor="conversionUnitId">Đơn vị thay thế</FieldLabel>
                <NativeSelect
                  id="conversionUnitId"
                  disabled={Boolean(editingConversion)}
                  {...form.register('unitId')}
                >
                  <NativeSelectOption value="">Chọn đơn vị</NativeSelectOption>
                  {units.map((unit) => (
                    <NativeSelectOption key={unit.id} value={unit.id}>
                      {unit.unitName}
                      {unit.symbol ? ` (${unit.symbol})` : ''}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError
                  errors={form.formState.errors.unitId ? [form.formState.errors.unitId] : undefined}
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.conversionFactor)}>
                <FieldLabel htmlFor="conversionFactor">Hệ số quy đổi</FieldLabel>
                <Input
                  id="conversionFactor"
                  type="number"
                  min="0.000001"
                  step="any"
                  {...form.register('conversionFactor', { valueAsNumber: true })}
                />
                <FieldDescription>
                  {selectedUnit && Number.isFinite(factor) && factor > 0
                    ? `1 ${selectedUnit.unitName} = ${factor} ${baseUnitName}`
                    : 'Nhập số đơn vị cơ sở tương ứng với một đơn vị thay thế.'}
                </FieldDescription>
                <FieldError
                  errors={
                    form.formState.errors.conversionFactor
                      ? [form.formState.errors.conversionFactor]
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
                onClick={() => onDialogOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                <Calculator data-icon="inline-start" aria-hidden="true" />
                {isPending ? 'Đang lưu…' : 'Lưu quy đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <StatusChangeDialog
        open={Boolean(statusTarget)}
        subject={`quy đổi “${statusTarget?.unitName ?? ''}”`}
        nextStatus={statusTarget?.status === 'Active' ? 'Inactive' : 'Active'}
        isPending={isPending}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        onConfirm={() => {
          if (!statusTarget) return
          onChangeStatus(statusTarget)
          setStatusTarget(null)
        }}
      />
    </Card>
  )
}
