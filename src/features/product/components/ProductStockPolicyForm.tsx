'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { stockPolicySchema, type StockPolicyFormValues } from '../schemas/product.schema'
import type { ProductResponse } from '../types/product.types'

interface ProductStockPolicyDialogProps {
  readonly open: boolean
  readonly product: ProductResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: StockPolicyFormValues) => void
}

export function ProductStockPolicyDialog({
  open,
  product,
  isPending,
  onOpenChange,
  onSubmit,
}: ProductStockPolicyDialogProps) {
  const form = useForm<StockPolicyFormValues>({
    resolver: zodResolver(stockPolicySchema),
    defaultValues: { minStockThreshold: product.minStockThreshold ?? 0 },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Chính sách tồn kho</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.minStockThreshold)}>
              <FieldLabel htmlFor="minStockThreshold">Ngưỡng tồn kho tối thiểu</FieldLabel>
              <Input
                id="minStockThreshold"
                type="number"
                min={0}
                placeholder="Vd: 10"
                className="h-10 rounded-lg text-sm"
                {...form.register('minStockThreshold', { valueAsNumber: true })}
              />
              <FieldError
                errors={
                  form.formState.errors.minStockThreshold
                    ? [form.formState.errors.minStockThreshold]
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
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" aria-hidden="true" />
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
