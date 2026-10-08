'use client'

import { ArrowLeft, MessageSquareWarning, PencilLine, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useState } from 'react'
import { LifecycleTimeline } from '@/components/operations/LifecycleTimeline'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import { APP_ROUTES } from '@/routes/app-routes'
import { TransferGoodsTable } from '../components/TransferGoods'
import {
  AddFeedbackDialog,
  AssignTransferTaskDialog,
  CreateShipmentDialog,
  ReplyFeedbackDialog,
  ResolveDiscrepancyDialog,
  ResolveEscalationDialog,
  TransferDiscrepancyPanel,
  TransferFeedbackPanel,
  TransferOverview,
  TransferShipmentsPanel,
} from '../components/TransferDetailPage'
import { TransferReasonDialog } from '../components/TransferShared'
import { TransferStatusBadge } from '../components/TransfersPage'
import { useTransferRealtime } from '../hooks/use-transfer-realtime'
import { useTransferRequestActions } from '../hooks/use-transfer-request-actions'
import { useTransferResolutionActions } from '../hooks/use-transfer-resolution-actions'
import { useTransferViewer } from '../hooks/use-transfer-viewer'
import { useTransferQuery } from '../hooks/use-transfers'
import {
  getShipmentCapabilities,
  getTransferCapabilities,
  hasOpenFeedback,
  remainingQuantity,
} from '../utils/transfer-capabilities'
import { visibleTransferItems } from '../utils/transfer-form'
import { transferGoodsRows } from '../utils/transfer-goods-rows'
import { transferTabIds } from '../utils/transfer-tabs'
import { buildTransferHistory } from '../utils/transfer-history'

type DetailTab = 'goods' | 'shipments' | 'discrepancies' | 'feedback' | 'history'

export default function TransferDetailPage({ transferId }: { readonly transferId: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<DetailTab>('goods')
  const tabIds = transferTabIds(useId(), tab)
  const { viewer } = useTransferViewer()
  const detailQuery = useTransferQuery(transferId)
  const transfer = detailQuery.data
  useTransferRealtime({ transferId })

  const requestActions = useTransferRequestActions(transfer)
  const resolutionActions = useTransferResolutionActions(transfer)

  const capabilities = getTransferCapabilities(viewer, transfer)
  const shipments = useMemo(() => transfer?.shipments ?? [], [transfer?.shipments])
  const discrepancies = transfer?.discrepancies ?? []
  const feedbacks = transfer?.feedbacks ?? []
  const shipmentCapabilities = useMemo(
    () =>
      Object.fromEntries(
        shipments.map((shipment) => [shipment.id, getShipmentCapabilities(viewer, shipment)])
      ),
    [shipments, viewer]
  )
  const history = useMemo(() => (transfer ? buildTransferHistory(transfer) : []), [transfer])
  const rows = useMemo(() => transferGoodsRows(transfer), [transfer])
  const closing = requestActions.closing

  const tabs: ReadonlyArray<{ value: DetailTab; label: string }> = [
    { value: 'goods', label: 'Hàng hóa' },
    { value: 'shipments', label: `Đợt xuất (${shipments.length})` },
    { value: 'discrepancies', label: `Chênh lệch (${discrepancies.length})` },
    { value: 'feedback', label: `Phản hồi (${feedbacks.length})` },
    { value: 'history', label: 'Lịch sử' },
  ]

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Quay lại danh sách"
            onClick={() => router.push(APP_ROUTES.transfers)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Điều chuyển kho</p>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
              <span className="font-mono" translate="no">
                {transfer?.transferCode ?? '…'}
              </span>
              {transfer ? <TransferStatusBadge status={transfer.status} /> : null}
            </h1>
          </div>
        </div>
        {transfer ? (
          <div className="flex flex-wrap gap-2">
            {capabilities.canEditDraft ? (
              <Button asChild size="sm" variant="outline">
                <Link href={APP_ROUTES.transferEdit(transfer.id)}>
                  <PencilLine aria-hidden="true" />
                  Soạn tiếp nháp
                </Link>
              </Button>
            ) : null}
            {capabilities.canEdit ? (
              <Button asChild size="sm" variant="outline">
                <Link href={APP_ROUTES.transferEdit(transfer.id)}>
                  <PencilLine aria-hidden="true" />
                  Sửa yêu cầu
                </Link>
              </Button>
            ) : null}
            {capabilities.canGiveFeedback ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={requestActions.feedback.open}
              >
                <MessageSquareWarning aria-hidden="true" />
                Phản hồi
              </Button>
            ) : null}
            {capabilities.canCreateShipment ? (
              <Button type="button" size="sm" onClick={requestActions.shipment.open}>
                <Plus aria-hidden="true" />
                Tạo đợt xuất
              </Button>
            ) : null}
            {capabilities.closingAction ? (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => closing.open(capabilities.closingAction ?? 'cancel')}
              >
                {capabilities.closingAction === 'stop' ? 'Dừng phần còn lại' : 'Hủy phiếu'}
              </Button>
            ) : null}
          </div>
        ) : null}
      </header>

      {detailQuery.isLoading ? (
        <OperationalLoadingState rows={4} />
      ) : detailQuery.isError || !transfer ? (
        <OperationalErrorState
          title="Không thể tải phiếu điều chuyển"
          onRetry={() => void detailQuery.refetch()}
        />
      ) : (
        <>
          {transfer.hasOpenFeedback || hasOpenFeedback(feedbacks) ? (
            <Alert className="shrink-0" role="status">
              <MessageSquareWarning aria-hidden="true" />
              <AlertTitle>Có phản hồi cần xử lý</AlertTitle>
              <AlertDescription>
                Quản lý kho đã báo vấn đề với phiếu này. Xem tab Phản hồi để trả lời, sửa phiếu,
                dừng phần còn lại hoặc hủy phiếu.
              </AlertDescription>
            </Alert>
          ) : null}
          <TransferOverview transfer={transfer} />
          <Tabs
            value={tab}
            onValueChange={(value) => {
              const next = tabs.find((candidate) => candidate.value === value)
              if (next) setTab(next.value)
            }}
            className="min-h-0 flex-1 gap-2"
          >
            <TabsList
              variant="workspace"
              aria-label="Nội dung phiếu điều chuyển"
              className="flex-wrap"
            >
              {tabs.map((candidate) => (
                <TabsTrigger
                  key={candidate.value}
                  value={candidate.value}
                  id={tabIds.tabId(candidate.value)}
                  aria-controls={tabIds.panelId}
                  className="flex-none px-3 py-1.5"
                >
                  {candidate.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <OperationalListPanel {...tabIds.panelProps}>
              {tab === 'goods' ? (
                <TransferGoodsTable key={transfer.id} selected rows={rows} />
              ) : (
                <div data-slot="operational-list-body">
                  {tab === 'shipments' ? (
                    <TransferShipmentsPanel
                      transferId={transfer.id}
                      shipments={shipments}
                      capabilities={shipmentCapabilities}
                      onCancelShipment={requestActions.cancelShipment.open}
                      onAssignTask={resolutionActions.assign.open}
                      onResolveEscalation={resolutionActions.escalation.open}
                    />
                  ) : tab === 'discrepancies' ? (
                    <TransferDiscrepancyPanel
                      discrepancies={discrepancies}
                      canResolve={capabilities.canResolveDiscrepancy}
                      onResolve={resolutionActions.discrepancy.open}
                    />
                  ) : tab === 'feedback' ? (
                    <TransferFeedbackPanel
                      feedbacks={feedbacks}
                      canReply={capabilities.canReplyFeedback}
                      onReply={requestActions.reply.open}
                    />
                  ) : (
                    <div className="p-4">
                      <LifecycleTimeline events={history} />
                    </div>
                  )}
                </div>
              )}
            </OperationalListPanel>
          </Tabs>
        </>
      )}

      <TransferReasonDialog
        open={closing.kind !== null}
        title={closing.kind === 'stop' ? 'Dừng phần còn lại?' : 'Hủy phiếu điều chuyển?'}
        description={
          closing.kind === 'stop'
            ? `Phần chưa xuất (${formatQuantity(transfer ? remainingQuantity(transfer) : 0)} theo ĐVT chính) sẽ bị dừng và nhả giữ chỗ. Các đợt đã xuất vẫn được nhận và xử lý chênh lệch bình thường.`
            : `Mọi đợt đang lấy hàng được hủy, toàn bộ ${formatQuantity(transfer ? visibleTransferItems(transfer.items).reduce((total, item) => total + item.quantity, 0) : 0)} (ĐVT chính) giữ chỗ được nhả và phiếu chuyển sang Đã hủy.`
        }
        confirmLabel={closing.kind === 'stop' ? 'Dừng phần còn lại' : 'Hủy phiếu'}
        pendingLabel="Đang xử lý…"
        form={closing.form}
        isPending={closing.isPending}
        onOpenChange={closing.onOpenChange}
        onSubmit={(values) => void closing.submit(values)}
      />
      <AddFeedbackDialog
        open={requestActions.feedback.isOpen}
        form={requestActions.feedback.form}
        itemOptions={visibleTransferItems(transfer?.items ?? []).map((item) => ({
          id: item.id,
          label: `${item.sku} · ${item.productName}`,
        }))}
        isPending={requestActions.feedback.isPending}
        onOpenChange={requestActions.feedback.onOpenChange}
        onSubmit={(values) => void requestActions.feedback.submit(values)}
      />
      <ReplyFeedbackDialog
        open={Boolean(requestActions.reply.target)}
        feedbackMessage={requestActions.reply.target?.message ?? ''}
        form={requestActions.reply.form}
        isPending={requestActions.reply.isPending}
        onOpenChange={requestActions.reply.onOpenChange}
        onSubmit={(values) => void requestActions.reply.submit(values)}
      />
      <CreateShipmentDialog
        open={requestActions.shipment.isOpen}
        form={requestActions.shipment.form}
        isPending={requestActions.shipment.isPending}
        onOpenChange={requestActions.shipment.onOpenChange}
        onSubmit={(values) => void requestActions.shipment.submit(values)}
      />
      <TransferReasonDialog
        open={Boolean(requestActions.cancelShipment.target)}
        title={`Hủy đợt xuất ${requestActions.cancelShipment.target?.shipmentNumber ?? ''}?`}
        description="Phần kế hoạch của đợt quay về chưa vào đợt (vẫn giữ chỗ) và công việc lấy hàng bị hủy. Hàng đã lấy phải được trả về vị trí trước."
        confirmLabel="Hủy đợt"
        pendingLabel="Đang hủy…"
        form={requestActions.cancelShipment.form}
        isPending={requestActions.cancelShipment.isPending}
        onOpenChange={requestActions.cancelShipment.onOpenChange}
        onSubmit={(values) => void requestActions.cancelShipment.submit(values)}
      />
      <AssignTransferTaskDialog
        target={resolutionActions.assign.target}
        staff={resolutionActions.assign.staff}
        isLoadingStaff={resolutionActions.assign.isLoadingStaff}
        isPending={resolutionActions.assign.isPending}
        onOpenChange={resolutionActions.assign.onOpenChange}
        onSubmit={(request) => void resolutionActions.assign.submit(request)}
      />
      <ResolveEscalationDialog
        open={resolutionActions.escalation.isOpen}
        escalations={resolutionActions.escalation.escalations}
        selectedExceptionId={resolutionActions.escalation.selectedExceptionId}
        alternatives={resolutionActions.escalation.alternatives}
        isLoading={resolutionActions.escalation.isLoading}
        form={resolutionActions.escalation.form}
        isPending={resolutionActions.escalation.isPending}
        onSelect={resolutionActions.escalation.select}
        onOpenChange={resolutionActions.escalation.onOpenChange}
        onSubmit={(values) => void resolutionActions.escalation.submit(values)}
      />
      <ResolveDiscrepancyDialog
        discrepancy={resolutionActions.discrepancy.target}
        form={resolutionActions.discrepancy.form}
        lotOptions={resolutionActions.discrepancy.lotOptions}
        isPending={resolutionActions.discrepancy.isPending}
        onOpenChange={resolutionActions.discrepancy.onOpenChange}
        onSubmit={(values) => void resolutionActions.discrepancy.submit(values)}
      />
    </div>
  )
}
