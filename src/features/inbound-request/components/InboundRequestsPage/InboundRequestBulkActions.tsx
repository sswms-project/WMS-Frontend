import { Check, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InboundRequestBulkActionsProps {
  readonly hasActions: boolean
  readonly selectedCount: number
  readonly selectedStatusLabel: string | null
  readonly showDraftActions: boolean
  readonly showApproveAction: boolean
  readonly canDelete: boolean
  readonly canSubmit: boolean
  readonly draftIds: readonly string[]
  readonly pendingIds: readonly string[]
  readonly isDeletingMany: boolean
  readonly isSubmitting: boolean
  readonly isApproving: boolean
  readonly onClearSelection: () => void
  readonly onDeleteMany: (ids: readonly string[]) => void
  readonly onSubmitMany: (ids: readonly string[]) => void
  readonly onApproveMany: (ids: readonly string[]) => void
}

export function InboundRequestBulkActions({
  hasActions,
  selectedCount,
  selectedStatusLabel,
  showDraftActions,
  showApproveAction,
  canDelete,
  canSubmit,
  draftIds,
  pendingIds,
  isDeletingMany,
  isSubmitting,
  isApproving,
  onClearSelection,
  onDeleteMany,
  onSubmitMany,
  onApproveMany,
}: InboundRequestBulkActionsProps) {
  if (!hasActions) return null
  const isPending = isDeletingMany || isSubmitting || isApproving

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm whitespace-nowrap">
        Đã chọn <strong>{selectedCount}</strong>
      </span>
      {selectedStatusLabel ? (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {selectedStatusLabel} · chỉ chọn cùng trạng thái
        </span>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        disabled={selectedCount === 0 || isPending}
        onClick={onClearSelection}
      >
        Bỏ chọn
      </Button>
      {showDraftActions && canSubmit ? (
        <Button
          type="button"
          disabled={draftIds.length === 0 || isPending}
          onClick={() => onSubmitMany(draftIds)}
        >
          <Send aria-hidden="true" />
          {isSubmitting ? 'Đang gửi…' : 'Gửi duyệt'}
        </Button>
      ) : null}
      {showApproveAction ? (
        <Button
          type="button"
          disabled={pendingIds.length === 0 || isPending}
          onClick={() => onApproveMany(pendingIds)}
        >
          <Check aria-hidden="true" />
          {isApproving ? 'Đang duyệt…' : 'Duyệt'}
        </Button>
      ) : null}
      {showDraftActions && canDelete ? (
        <Button
          type="button"
          variant="destructive"
          disabled={draftIds.length === 0 || isPending}
          onClick={() => onDeleteMany(draftIds)}
        >
          <Trash2 aria-hidden="true" />
          {isDeletingMany ? 'Đang xoá…' : 'Xoá'}
        </Button>
      ) : null}
    </div>
  )
}
