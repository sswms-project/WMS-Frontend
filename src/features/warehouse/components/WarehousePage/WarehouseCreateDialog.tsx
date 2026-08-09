'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Plus } from 'lucide-react'
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
import {
  createWarehouseSchema,
  type CreateWarehouseFormValues,
} from '../../schemas/warehouse.schema'

interface WarehouseCreateDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CreateWarehouseFormValues) => Promise<boolean>
}

const defaultValues: CreateWarehouseFormValues = {
  warehouseCode: '',
  warehouseName: '',
  address: '',
}

export function WarehouseCreateDialog({
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: WarehouseCreateDialogProps) {
  const form = useForm<CreateWarehouseFormValues>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues,
  })
  const { errors } = form.formState

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isPending) form.reset(defaultValues)
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: CreateWarehouseFormValues) {
    const isSuccessful = await onSubmit(values)
    if (isSuccessful) form.reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo kho</DialogTitle>
          <DialogDescription>
            Thêm một kho mới vào không gian vận hành của tổ chức.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.warehouseCode)}>
              <FieldLabel htmlFor="warehouse-code">Mã kho</FieldLabel>
              <Input
                id="warehouse-code"
                autoComplete="off"
                aria-invalid={Boolean(errors.warehouseCode)}
                placeholder="VD: HCM-01"
                {...form.register('warehouseCode')}
              />
              <FieldError errors={[errors.warehouseCode]} />
            </Field>

            <Field data-invalid={Boolean(errors.warehouseName)}>
              <FieldLabel htmlFor="warehouse-name">Tên kho</FieldLabel>
              <Input
                id="warehouse-name"
                autoComplete="off"
                aria-invalid={Boolean(errors.warehouseName)}
                placeholder="VD: Kho Thủ Đức"
                {...form.register('warehouseName')}
              />
              <FieldError errors={[errors.warehouseName]} />
            </Field>

            <Field data-invalid={Boolean(errors.address)}>
              <FieldLabel htmlFor="warehouse-address">Địa chỉ</FieldLabel>
              <Textarea
                id="warehouse-address"
                rows={3}
                aria-invalid={Boolean(errors.address)}
                placeholder="Địa chỉ kho (không bắt buộc)"
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
                <Plus data-icon="inline-start" aria-hidden="true" />
              )}
              Tạo kho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
