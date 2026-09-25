import { Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormActionsProps {
  readonly isPending: boolean
  readonly onSaveDraft: () => void
  readonly onSaveAndSubmit?: () => void
}

export function FormActions({ isPending, onSaveDraft, onSaveAndSubmit }: FormActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button type="button" variant="outline" disabled={isPending} onClick={onSaveDraft}>
        <Save aria-hidden="true" />
        Lưu nháp
      </Button>
      <Button
        type={onSaveAndSubmit ? 'button' : 'submit'}
        disabled={isPending}
        onClick={onSaveAndSubmit}
      >
        <Send aria-hidden="true" />
        Lưu và gửi duyệt
      </Button>
    </div>
  )
}
