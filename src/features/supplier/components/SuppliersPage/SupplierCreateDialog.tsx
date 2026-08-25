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
import { saveSupplierSchema, type SaveSupplierFormValues } from '../../schemas/supplier.schema'
import { SupplierFormFields } from './SupplierFormFields'

const defaultValues: SaveSupplierFormValues = {
  supplierName: '',
  phone: '',
  email: '',
  address: '',
}

interface SupplierCreateDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: SaveSupplierFormValues) => Promise<boolean>
}

export function SupplierCreateDialog({
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: SupplierCreateDialogProps) {
  const form = useForm<SaveSupplierFormValues>({
    resolver: zodResolver(saveSupplierSchema),
    defaultValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return
    if (!nextOpen) form.reset(defaultValues)
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: SaveSupplierFormValues) {
    const isSucceeded = await onSubmit(values)
    if (isSucceeded) form.reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm nhà cung cấp</DialogTitle>
          <DialogDescription>
            Nhập thông tin liên hệ để bắt đầu tạo đơn mua với nhà cung cấp này.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <SupplierFormFields idPrefix="create" form={form} />
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
              Tạo nhà cung cấp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
