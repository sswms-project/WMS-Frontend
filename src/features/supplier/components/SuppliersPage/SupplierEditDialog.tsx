'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save } from 'lucide-react'
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
import type { Supplier } from '../../types/supplier.types'
import { SupplierFormFields } from './SupplierFormFields'

function toFormValues(supplier: Supplier | null): SaveSupplierFormValues {
  return {
    supplierCode: supplier?.supplierCode ?? '',
    supplierName: supplier?.supplierName ?? '',
    taxCode: supplier?.taxCode ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    contactSalutation: supplier?.contactSalutation ?? '',
    contactName: supplier?.contactName ?? '',
    contactEmail: supplier?.contactEmail ?? '',
    contactMobile: supplier?.contactMobile ?? '',
    contactChannel: supplier?.contactChannel ?? '',
    contactChannelName: supplier?.contactChannelName ?? '',
  }
}

interface SupplierEditDialogProps {
  readonly open: boolean
  readonly supplier: Supplier | null
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: SaveSupplierFormValues) => Promise<boolean>
}

export function SupplierEditDialog({
  open,
  supplier,
  isPending,
  onOpenChange,
  onSubmit,
}: SupplierEditDialogProps) {
  const form = useForm<SaveSupplierFormValues>({
    resolver: zodResolver(saveSupplierSchema),
    defaultValues: toFormValues(supplier),
  })
  const { reset } = form

  useEffect(() => {
    if (open) reset(toFormValues(supplier))
  }, [open, supplier, reset])

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return
    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: SaveSupplierFormValues) {
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cập nhật nhà cung cấp</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin liên hệ của {supplier?.supplierName ?? 'nhà cung cấp'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <SupplierFormFields idPrefix="edit" form={form} />
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
