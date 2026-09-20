import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { RejectGoodsReturnRequestFormValues } from '../../schemas/reject-return.schema'
import type { GoodsReturnRequestSummary } from '../../types/stock-issue.types'

export function RejectGoodsReturnRequestDialog({
  item,
  form,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  readonly item: GoodsReturnRequestSummary | null
  readonly form: UseFormReturn<RejectGoodsReturnRequestFormValues>
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: RejectGoodsReturnRequestFormValues) => void
}) {
  const error = form.formState.errors.reason
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối yêu cầu trả hàng</DialogTitle>
          <DialogDescription>
            {item
              ? `Ghi rõ lý do từ chối ${item.goodsReturnRequestCode}.`
              : 'Ghi rõ lý do từ chối.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="reject-return-reason">Lý do</FieldLabel>
            <Textarea
              id="reject-return-reason"
              aria-invalid={Boolean(error)}
              {...form.register('reason')}
            />
            <FieldError errors={[error]} />
          </Field>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}Từ chối
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
