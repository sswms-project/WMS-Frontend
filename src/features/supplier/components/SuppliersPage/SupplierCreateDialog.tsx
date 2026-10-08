'use client'

import { LoaderCircle, Plus } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { BusinessCodeFieldProps } from '@/components/forms/BusinessCodeField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SaveSupplierFormValues } from '../../schemas/supplier.schema'
import { SupplierFormFields } from './SupplierFormFields'

interface SupplierCreateDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly form: UseFormReturn<SaveSupplierFormValues>
  readonly codeSuggestionStatus: BusinessCodeFieldProps['suggestionStatus']
  readonly onCodeChange: () => void
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: SaveSupplierFormValues) => Promise<boolean>
}

export function SupplierCreateDialog({
  open,
  isPending,
  form,
  codeSuggestionStatus,
  onCodeChange,
  onOpenChange,
  onSubmit,
}: SupplierCreateDialogProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return
    onOpenChange(nextOpen)
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
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <SupplierFormFields
            idPrefix="create"
            form={form}
            codeSuggestionStatus={codeSuggestionStatus}
            onCodeChange={onCodeChange}
            codeDescription="Mã được gợi ý, có thể chỉnh sửa."
            isPending={isPending}
          />
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
