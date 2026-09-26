'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Plus } from 'lucide-react'
import { useEffect } from 'react'
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
  supplierCode: '',
  supplierName: '',
  taxCode: '',
  phone: '',
  email: '',
  address: '',
  contactSalutation: '',
  contactName: '',
  contactEmail: '',
  contactMobile: '',
  contactChannel: '',
  contactChannelName: '',
}

interface SupplierCreateDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly suggestedCode?: string
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: SaveSupplierFormValues) => Promise<boolean>
}

export function SupplierCreateDialog({
  open,
  isPending,
  suggestedCode,
  onOpenChange,
  onSubmit,
}: SupplierCreateDialogProps) {
  const form = useForm<SaveSupplierFormValues>({
    resolver: zodResolver(saveSupplierSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open || !suggestedCode || form.getFieldState('supplierCode').isDirty) return
    if (!form.getValues('supplierCode')) {
      form.setValue('supplierCode', suggestedCode, { shouldDirty: false })
    }
  }, [form, open, suggestedCode])

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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Thêm nhà cung cấp</DialogTitle>
          <DialogDescription>
            Nhập thông tin nhà cung cấp phục vụ hoạt động nhập kho.
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
