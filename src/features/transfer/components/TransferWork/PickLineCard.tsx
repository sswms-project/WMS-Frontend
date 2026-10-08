import { ArrowLeftRight, CircleCheck, TriangleAlert, Undo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import type { TransferPickSheetLine } from '../../types/transfer.types'
import {
  PICK_REASON_LABELS,
  SHIPMENT_LINE_STATUS_LABELS,
  labelOf,
} from '../../utils/transfer-format'
import { formatTransferLocation } from '../../utils/transfer-location'

interface PickLineCardProps {
  readonly line: TransferPickSheetLine
  readonly canAct: boolean
  readonly onPick: (line: TransferPickSheetLine) => void
  readonly onSwitch: (line: TransferPickSheetLine) => void
  readonly onEscalate: (line: TransferPickSheetLine) => void
  readonly onReturn: (line: TransferPickSheetLine) => void
}

export function PickLineCard({
  line,
  canAct,
  onPick,
  onSwitch,
  onEscalate,
  onReturn,
}: PickLineCardProps) {
  const isDone = line.remainingQuantity <= 0 && line.pendingReturnQuantity <= 0
  const isPendingManager = line.status === 'PendingManager'
  const pendingExceptions = line.exceptions.filter(
    (exception) => exception.status === 'PendingManager'
  )
  // Phần đã xuất không còn nằm trong "đã lấy chờ xuất" nhưng vẫn là hàng nhân viên đã lấy.
  const totalPicked =
    line.pickedQuantity + line.picks.reduce((sum, pick) => sum + pick.dispatchedQuantity, 0)
  const outstandingPicks = line.picks.filter(
    (pick) => pick.pickedQuantity - pick.returnedQuantity - pick.dispatchedQuantity > 0
  )

  return (
    <article className="bg-card border" aria-label={`Dòng hàng ${line.sku}`}>
      <header className="flex flex-wrap items-start justify-between gap-2 border-b p-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold" translate="no">
            {line.sku}
          </p>
          <p className="text-sm">{line.productName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={isDone ? 'default' : isPendingManager ? 'outline' : 'secondary'}>
            {isDone ? <CircleCheck aria-hidden="true" /> : null}
            {SHIPMENT_LINE_STATUS_LABELS[line.status]}
          </Badge>
          <p className="text-sm tabular-nums">
            Đã lấy <strong>{formatQuantity(totalPicked)}</strong> /{' '}
            {formatQuantity(line.plannedQuantity)} {line.baseUnitName}
          </p>
        </div>
      </header>

      {line.suggestions.length > 0 && !isPendingManager && canAct ? (
        <div className="border-b p-3">
          <p className="text-muted-foreground mb-1 text-xs font-medium">Lấy tại (theo FEFO)</p>
          <ul className="grid gap-1">
            {line.suggestions.map((suggestion) => (
              <li
                key={suggestion.inventoryStockId}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-mono font-medium" translate="no">
                  {formatTransferLocation(suggestion)}
                </span>
                <span className="text-muted-foreground text-xs">
                  {suggestion.lotNumber ? `Lô ${suggestion.lotNumber}` : 'Không theo lô'}
                  {suggestion.expiryDate
                    ? ` · HSD ${formatOperationalDate(suggestion.expiryDate)}`
                    : ''}
                </span>
                <span className="tabular-nums">
                  {formatQuantity(suggestion.suggestedQuantity)} {line.baseUnitName}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pendingExceptions.length > 0 ? (
        <div className="bg-muted flex items-start gap-2 border-b p-3 text-sm" role="status">
          <TriangleAlert className="text-warning mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Đã báo quản lý, đang chờ xử lý</p>
            {pendingExceptions.map((exception) => (
              <p key={exception.id} className="text-muted-foreground text-xs">
                {labelOf(PICK_REASON_LABELS, exception.reasonCode)}
                {exception.note ? ` · ${exception.note}` : ''}
              </p>
            ))}
            <p className="text-muted-foreground text-xs">Bạn có thể tiếp tục các dòng khác.</p>
          </div>
        </div>
      ) : null}

      {line.pendingReturnQuantity > 0 ? (
        <div className="border-b p-3 text-sm" role="status">
          <p className="text-warning font-medium">
            Đã lấy dư {formatQuantity(line.pendingReturnQuantity)} {line.baseUnitName}: cần trả về
            vị trí trước khi xuất đợt.
          </p>
        </div>
      ) : null}

      {line.picks.length > 0 ? (
        <ul className="grid gap-1 border-b p-3 text-xs">
          {line.picks.map((pick) => (
            <li key={pick.id} className="flex flex-wrap justify-between gap-2">
              <span className="font-mono" translate="no">
                {formatTransferLocation(pick)}
                {pick.lotNumber ? ` · lô ${pick.lotNumber}` : ''}
              </span>
              <span className="tabular-nums">
                Lấy {formatQuantity(pick.pickedQuantity)}
                {pick.returnedQuantity > 0 ? ` · trả ${formatQuantity(pick.returnedQuantity)}` : ''}
                {pick.dispatchedQuantity > 0
                  ? ` · xuất ${formatQuantity(pick.dispatchedQuantity)}`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {canAct ? (
        <footer className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            type="button"
            className="h-11"
            disabled={line.remainingQuantity <= 0 || isPendingManager}
            onClick={() => onPick(line)}
          >
            Lấy hàng
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={line.remainingQuantity <= 0 || isPendingManager}
            onClick={() => onSwitch(line)}
          >
            <ArrowLeftRight aria-hidden="true" />
            Đổi vị trí/lô
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={line.remainingQuantity <= 0 || isPendingManager}
            onClick={() => onEscalate(line)}
          >
            <TriangleAlert aria-hidden="true" />
            Báo quản lý
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={outstandingPicks.length === 0}
            onClick={() => onReturn(line)}
          >
            <Undo2 aria-hidden="true" />
            Trả hàng về vị trí
          </Button>
        </footer>
      ) : null}
    </article>
  )
}
