import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { InboundRequestCodeFormValues } from '../../schemas/inbound-request.schema'

export function InboundRequestCodeForm({
  form,
  isPending,
  onSave,
  onCancel,
}: {
  readonly form: UseFormReturn<InboundRequestCodeFormValues>
  readonly isPending: boolean
  readonly onSave: () => void
  readonly onCancel: () => void
}) {
  const {
    register,
    formState: { errors },
  } = form
  return (
    <form
      className="bg-card flex flex-col gap-4 border p-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <h1 className="text-lg font-semibold">Đổi mã yêu cầu nhập kho</h1>
      <FieldDescription>
        Nội dung đã phát sinh được giữ nguyên. Đổi mã không cập nhật lại email hoặc chứng từ đã gửi
        trước đó.
      </FieldDescription>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.inboundRequestCode)}>
          <FieldLabel htmlFor="request-code">Mã yêu cầu *</FieldLabel>
          <Input
            id="request-code"
            maxLength={100}
            aria-invalid={Boolean(errors.inboundRequestCode)}
            {...register('inboundRequestCode')}
          />
          <FieldError>{errors.inboundRequestCode?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="code-reason">Lý do đổi mã *</FieldLabel>
          <Textarea
            id="code-reason"
            maxLength={500}
            aria-invalid={Boolean(errors.reason)}
            {...register('reason')}
          />
          <FieldError>{errors.reason?.message}</FieldError>
        </Field>
      </FieldGroup>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isPending}>
          Lưu mã
        </Button>
      </div>
    </form>
  )
}
