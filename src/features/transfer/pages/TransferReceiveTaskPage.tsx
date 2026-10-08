'use client'

import { PackageCheck } from 'lucide-react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { Button } from '@/components/ui/button'
import { P } from '@/config/permissionCodes'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import {
  ReceiveEntryCard,
  ScanPreferencesBar,
  TransferWorkHeader,
} from '../components/TransferWork'
import { TransferChangedBanner, TransferConfirmDialog } from '../components/TransferShared'
import { useTransferReceiveSheetQuery } from '../hooks/use-transfer-fulfillment'
import { useTransferReceiveForm } from '../hooks/use-transfer-receive-form'
import { useTransferRealtime } from '../hooks/use-transfer-realtime'
import { useTransferViewer } from '../hooks/use-transfer-viewer'

interface TransferReceiveTaskPageProps {
  readonly transferId: string
  readonly shipmentId: string
}

export default function TransferReceiveTaskPage({
  transferId,
  shipmentId,
}: TransferReceiveTaskPageProps) {
  const { viewer } = useTransferViewer()
  const sheetQuery = useTransferReceiveSheetQuery(transferId, shipmentId)
  const sheet = sheetQuery.data
  const realtime = useTransferRealtime({ transferId, autoRefresh: false })
  const receive = useTransferReceiveForm(transferId, shipmentId, sheet)

  const isReceivable =
    sheet?.shipmentStatus === 'InTransit' || sheet?.shipmentStatus === 'Receiving'
  const canAct = viewer.permissions.includes(P.TRANSFERS_RECEIVE) && isReceivable
  const values = receive.form.watch('entries')
  const totals = values.reduce(
    (sum, entry) => ({
      good: sum.good + (entry.goodQuantity || 0),
      damaged: sum.damaged + (entry.damagedQuantity || 0),
      missing: sum.missing + (entry.missingQuantity || 0),
    }),
    { good: 0, damaged: 0, missing: 0 }
  )

  function reload() {
    realtime.dismiss()
    receive.reset()
    void sheetQuery.refetch()
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3">
      {sheet ? (
        <TransferWorkHeader
          heading="Nhận hàng điều chuyển"
          transferId={transferId}
          transferCode={sheet.transferCode}
          shipmentNumber={sheet.shipmentNumber}
          shipmentStatus={sheet.shipmentStatus}
          route={`Nhận tại ${sheet.destinationWarehouseName}`}
        />
      ) : null}
      {realtime.hasPendingChange ? (
        <TransferChangedBanner onReload={reload} onDismiss={realtime.dismiss} />
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {sheetQuery.isLoading ? (
          <OperationalLoadingState rows={3} />
        ) : sheetQuery.isError || !sheet ? (
          <OperationalErrorState
            title="Không thể tải phiếu nhận hàng"
            onRetry={() => void sheetQuery.refetch()}
          />
        ) : sheet.lines.length === 0 ? (
          <OperationalEmptyState
            title="Đợt này chưa có hàng để nhận"
            description="Đợt cần được xuất khỏi kho xuất trước khi nhận."
          />
        ) : (
          <form
            className="grid gap-3 pb-3"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void receive.requestConfirm()
            }}
          >
            {!isReceivable ? (
              <p className="text-muted-foreground text-sm" role="status">
                Đợt này không còn ở trạng thái chờ nhận nên chỉ xem được.
              </p>
            ) : null}
            {canAct ? <ScanPreferencesBar /> : null}
            {receive.fields.map((field, index) => {
              const entry = values[index]
              const line = entry ? receive.lineById.get(entry.lineId) : undefined
              const lot = line?.lots.find((candidate) => candidate.lotId === (entry?.lotId ?? null))
              if (!entry || !line) return null
              return (
                <ReceiveEntryCard
                  key={field.id}
                  index={index}
                  form={receive.form}
                  heading={`${line.sku} · ${line.productName}`}
                  lotLabel={
                    lot?.lotNumber
                      ? `Lô ${lot.lotNumber}${lot.expiryDate ? ` · HSD ${formatOperationalDate(lot.expiryDate)}` : ''}`
                      : 'Không theo lô'
                  }
                  dispatchedQuantity={lot?.dispatchedQuantity ?? 0}
                  baseUnitName={line.baseUnitName}
                  canRemove={receive.countEntriesOf(index) > 1}
                  disabled={!canAct || receive.isReceiving}
                  isFindingSlot={receive.isFindingSlot}
                  onScanSlot={receive.scanSlot}
                  onScanProduct={receive.scanProduct}
                  onSplit={receive.splitEntry}
                  onRemove={receive.removeEntry}
                />
              )
            })}
          </form>
        )}
      </div>

      {canAct && sheet && sheet.lines.length > 0 ? (
        <footer className="bg-background shrink-0 border-t pt-3">
          <p className="mb-2 text-sm tabular-nums" aria-live="polite">
            Tốt {formatQuantity(totals.good)} · Hỏng {formatQuantity(totals.damaged)} · Thiếu{' '}
            {formatQuantity(totals.missing)}
          </p>
          <Button
            type="button"
            className="h-12 w-full text-base"
            disabled={receive.isReceiving}
            onClick={() => void receive.requestConfirm()}
          >
            <PackageCheck aria-hidden="true" />
            Xác nhận nhận đợt
          </Button>
        </footer>
      ) : null}

      <TransferConfirmDialog
        open={receive.isConfirmOpen}
        title="Xác nhận nhận đợt hàng?"
        description={
          <p>
            Nhận tốt <strong>{formatQuantity(totals.good)}</strong>, hỏng{' '}
            <strong>{formatQuantity(totals.damaged)}</strong>, thiếu{' '}
            <strong>{formatQuantity(totals.missing)}</strong>. Mỗi đợt chỉ nhận một lần; hàng thiếu
            đến sau được xử lý ở mục chênh lệch.
          </p>
        }
        confirmLabel="Xác nhận nhận"
        pendingLabel="Đang nhận…"
        isPending={receive.isReceiving}
        onOpenChange={receive.setIsConfirmOpen}
        onConfirm={() => void receive.confirm()}
      />
    </div>
  )
}
