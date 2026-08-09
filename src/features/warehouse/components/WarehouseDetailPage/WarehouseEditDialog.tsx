'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import type { WarehouseDetailResponse } from '@/types/warehouse'
import {
  updateWarehouseSchema,
  type UpdateWarehouseFormValues,
} from '../../schemas/warehouse.schema'

interface WarehouseEditDialogProps {
  readonly warehouse: WarehouseDetailResponse
  readonly open: boolean
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: UpdateWarehouseFormValues) => Promise<boolean>
}

function formValuesFromWarehouse(warehouse: WarehouseDetailResponse): UpdateWarehouseFormValues {
  return {
    warehouseName: warehouse.warehouseName,
    address: warehouse.address ?? '',
  }
}

export function WarehouseEditDialog({
  warehouse,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: WarehouseEditDialogProps) {
  const form = useForm<UpdateWarehouseFormValues>({
    resolver: zodResolver(updateWarehouseSchema),
    defaultValues: formValuesFromWarehouse(warehouse),
  })
  const { errors } = form.formState

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isPending) form.reset(formValuesFromWarehouse(warehouse))
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: UpdateWarehouseFormValues) {
    const isSuccessful = await onSubmit(values)
    if (isSuccessful) form.reset(values)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa kho</DialogTitle>
          <DialogDescription>
            Mã kho <span className="font-mono">{warehouse.warehouseCode}</span> được cố định sau khi
            tạo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.warehouseName)}>
              <FieldLabel htmlFor="edit-warehouse-name">Tên kho</FieldLabel>
              <Input
                id="edit-warehouse-name"
                aria-invalid={Boolean(errors.warehouseName)}
                {...form.register('warehouseName')}
              />
              <FieldError errors={[errors.warehouseName]} />
            </Field>

            <Field data-invalid={Boolean(errors.address)}>
              <FieldLabel htmlFor="edit-warehouse-address">Địa chỉ</FieldLabel>
              <Textarea
                id="edit-warehouse-address"
                rows={3}
                aria-invalid={Boolean(errors.address)}
                {...form.register('address')}
              />
              <FieldError errors={[errors.address]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save data-icon="inline-start" aria-hidden="true" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
