import { P } from '@/config/permissionCodes'
import type {
  TransferDetail,
  TransferDiscrepancy,
  TransferFeedback,
  TransferShipment,
  TransferShipmentLine,
} from '../types/transfer.types'

export interface TransferViewer {
  readonly permissions: readonly string[]
  readonly currentUserId: string | null
  /** Chủ doanh nghiệp được sửa/hủy mọi phiếu; người khác chỉ phiếu do mình tạo (BE kiểm lại). */
  readonly isTenantOwner: boolean
}

export type TransferClosingAction = 'cancel' | 'stop' | null

export interface TransferCapabilities {
  readonly canEditDraft: boolean
  readonly canEdit: boolean
  readonly canGiveFeedback: boolean
  readonly canReplyFeedback: boolean
  readonly canCreateShipment: boolean
  readonly canResolveDiscrepancy: boolean
  /** UI chỉ hiện một nút: Hủy phiếu khi chưa xuất đợt nào, Dừng phần còn lại khi đã xuất. */
  readonly closingAction: TransferClosingAction
}

export interface ShipmentCapabilities {
  readonly canCancel: boolean
  readonly canOpenPick: boolean
  readonly canOpenReceive: boolean
  readonly canAssignTask: boolean
  readonly canResolveEscalation: boolean
}

const NONE: TransferCapabilities = {
  canEditDraft: false,
  canEdit: false,
  canGiveFeedback: false,
  canReplyFeedback: false,
  canCreateShipment: false,
  canResolveDiscrepancy: false,
  closingAction: null,
}

function has(viewer: TransferViewer, permission: string) {
  return viewer.permissions.includes(permission)
}

export function hasDispatchedAny(transfer: Pick<TransferDetail, 'items'>) {
  return transfer.items.some((item) => item.dispatchedQuantity > 0)
}

/** Số lượng (theo ĐVT chính) chưa xuất và chưa bị dừng của cả phiếu. */
export function remainingQuantity(transfer: Pick<TransferDetail, 'items'>) {
  return transfer.items.reduce(
    (total, item) =>
      total + Math.max(0, item.quantity - item.stoppedQuantity - item.dispatchedQuantity),
    0
  )
}

export function unbatchedQuantity(transfer: Pick<TransferDetail, 'items'>) {
  return transfer.items.reduce((total, item) => total + Math.max(0, item.unbatchedQuantity), 0)
}

export function hasOpenFeedback(feedbacks: readonly TransferFeedback[] | null | undefined) {
  return (feedbacks ?? []).some((feedback) => feedback.status !== 'Closed')
}

export function openDiscrepancies(
  discrepancies: readonly TransferDiscrepancy[] | null | undefined
) {
  return (discrepancies ?? []).filter((discrepancy) => discrepancy.isOpen)
}

/** Khả năng hiển thị theo quyền hiệu lực và trạng thái; BE vẫn kiểm lại mọi thao tác. */
export function getTransferCapabilities(
  viewer: TransferViewer,
  transfer: TransferDetail | null | undefined
): TransferCapabilities {
  if (!transfer || transfer.isLegacyWorkflow) return NONE

  const canCreate = has(viewer, P.TRANSFERS_CREATE)
  const canCancel = has(viewer, P.TRANSFERS_CANCEL)
  const isCreator = transfer.createdBy === viewer.currentUserId
  const isOwnDraft = transfer.status === 'Draft' && isCreator
  const isInProgress = transfer.status === 'InProgress'
  const isOpen = isInProgress || transfer.status === 'AwaitingResolution'
  const mayChange = viewer.isTenantOwner || isCreator
  const dispatched = hasDispatchedAny(transfer)

  let closingAction: TransferClosingAction = null
  if (canCancel && isOwnDraft) closingAction = 'cancel'
  else if (canCancel && mayChange && isInProgress && !dispatched) closingAction = 'cancel'
  else if (canCancel && mayChange && isInProgress && dispatched && remainingQuantity(transfer) > 0)
    closingAction = 'stop'

  return {
    canEditDraft: canCreate && isOwnDraft,
    canEdit: canCreate && mayChange && isInProgress,
    canGiveFeedback:
      isOpen && (has(viewer, P.TRANSFERS_DISPATCH) || has(viewer, P.TRANSFERS_RECEIVE)),
    canReplyFeedback: canCreate && isOpen && hasOpenFeedback(transfer.feedbacks),
    canCreateShipment:
      has(viewer, P.TRANSFERS_DISPATCH) && isInProgress && unbatchedQuantity(transfer) > 0,
    canResolveDiscrepancy:
      has(viewer, P.TRANSFERS_RESOLVE) && openDiscrepancies(transfer.discrepancies).length > 0,
    closingAction,
  }
}

export function getShipmentCapabilities(
  viewer: TransferViewer,
  shipment: Pick<TransferShipment, 'status' | 'lines'>
): ShipmentCapabilities {
  const isPicking = shipment.status === 'Picking'
  const isReceivable = shipment.status === 'InTransit' || shipment.status === 'Receiving'
  return {
    canCancel: has(viewer, P.TRANSFERS_DISPATCH) && isPicking,
    canOpenPick: has(viewer, P.TRANSFERS_PICK) && isPicking,
    canOpenReceive: has(viewer, P.TRANSFERS_RECEIVE) && isReceivable,
    canAssignTask: has(viewer, P.WAREHOUSE_TASKS_ASSIGN) && (isPicking || isReceivable),
    canResolveEscalation:
      has(viewer, P.TRANSFERS_DISPATCH) &&
      isPicking &&
      shipment.lines.some((line) => line.status === 'PendingManager'),
  }
}

export function isLinePendingManager(line: Pick<TransferShipmentLine, 'status'>) {
  return line.status === 'PendingManager'
}
