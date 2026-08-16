'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Plus } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
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
import {
  clearWarehouseCreateDraft,
  getWarehouseCreateDraft,
  saveWarehouseCreateDraft,
} from '../../utils/warehouse-create-draft'

interface WarehouseCreateDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly warehouseCodeError?: string
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
  warehouseCodeError,
  onOpenChange,
  onSubmit,
}: WarehouseCreateDialogProps) {
  const [initialDraft] = useState(getWarehouseCreateDraft)
  const form = useForm<CreateWarehouseFormValues>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: initialDraft,
  })
  const draftValues = useWatch({ control: form.control })
  const { errors } = form.formState
  const hasWarehouseCodeError = Boolean(errors.warehouseCode || warehouseCodeError)

  useEffect(() => {
    saveWarehouseCreateDraft(form.getValues())
  }, [draftValues, form])

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: CreateWarehouseFormValues) {
    const isSuccessful = await onSubmit(values)
    if (isSuccessful) {
      clearWarehouseCreateDraft()
      form.reset(defaultValues)
    }
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
            <Field data-invalid={hasWarehouseCodeError}>
              <FieldLabel htmlFor="warehouse-code">Mã kho</FieldLabel>
              <Input
                id="warehouse-code"
                autoComplete="off"
                aria-invalid={hasWarehouseCodeError}
                spellCheck={false}
                placeholder="VD: HCM-01"
                {...form.register('warehouseCode')}
              />
              <FieldError errors={[errors.warehouseCode]} />
              {warehouseCodeError && <FieldError>{warehouseCodeError}</FieldError>}
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
                autoComplete="street-address"
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
