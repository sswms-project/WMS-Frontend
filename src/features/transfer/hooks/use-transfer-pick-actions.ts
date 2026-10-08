'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useReducer, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  transferPickEscalateSchema,
  transferPickReturnSchema,
  transferPickSwitchSchema,
  type TransferPickEscalateFormValues,
  type TransferPickReturnFormValues,
  type TransferPickSwitchFormValues,
} from '../schemas/transfer-fulfillment.schema'
import type {
  TransferPickAlternative,
  TransferPickDetail,
  TransferPickSheet,
  TransferPickSheetLine,
} from '../types/transfer.types'
import {
  INITIAL_PICK_SCAN_STATE,
  getDefaultPickQuantity,
  isNonFefoChoice,
  pickScanReducer,
  validatePickQuantity,
} from '../utils/transfer-scan'
import { useTransferActionRunner } from './use-transfer-action-runner'
import {
  useDispatchTransferShipmentMutation,
  useEscalateTransferPickMutation,
  useRecordTransferPickMutation,
  useReturnTransferPickMutation,
  useSwitchTransferPickMutation,
  useTransferPickAlternativesQuery,
} from './use-transfer-fulfillment'

const EMPTY_SWITCH: TransferPickSwitchFormValues = {
  toInventoryStockId: '',
  quantity: 1,
  reasonCode: 'InsufficientAtLocation',
  note: '',
}

const EMPTY_ESCALATE: TransferPickEscalateFormValues = { reasonCode: 'NotFound', note: '' }

function outstandingOf(pick: TransferPickDetail) {
  return pick.pickedQuantity - pick.returnedQuantity - pick.dispatchedQuantity
}

/** Toàn bộ trạng thái thao tác của màn lấy hàng: quét mã, đổi vị trí/lô, báo quản lý, trả hàng, xuất đợt. */
export function useTransferPickActions(
  transferId: string,
  shipmentId: string,
  sheet: TransferPickSheet | undefined
) {
  const run = useTransferActionRunner()

  const [entryLine, setEntryLine] = useState<TransferPickSheetLine | null>(null)
  const [scan, dispatchScan] = useReducer(pickScanReducer, INITIAL_PICK_SCAN_STATE)
  const [quantityOverride, setQuantityOverride] = useState<number | null>(null)
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const [switchLine, setSwitchLine] = useState<TransferPickSheetLine | null>(null)
  const [escalateLine, setEscalateLine] = useState<TransferPickSheetLine | null>(null)
  const [returnLine, setReturnLine] = useState<TransferPickSheetLine | null>(null)
  const [returnScanError, setReturnScanError] = useState<string | null>(null)
  const [isDispatchOpen, setIsDispatchOpen] = useState(false)

  const switchForm = useForm<TransferPickSwitchFormValues>({
    resolver: zodResolver(transferPickSwitchSchema),
    defaultValues: EMPTY_SWITCH,
  })
  const escalateForm = useForm<TransferPickEscalateFormValues>({
    resolver: zodResolver(transferPickEscalateSchema),
    defaultValues: EMPTY_ESCALATE,
  })
  const returnForm = useForm<TransferPickReturnFormValues>({
    resolver: zodResolver(transferPickReturnSchema),
    defaultValues: { pickDetailId: '', quantity: 1, scannedSlotCode: '' },
  })

  const alternativeLine = entryLine ?? switchLine
  const alternativesQuery = useTransferPickAlternativesQuery(
    transferId,
    shipmentId,
    alternativeLine?.lineId ?? null
  )
  const alternatives = useMemo(() => alternativesQuery.data ?? [], [alternativesQuery.data])

  const recordMutation = useRecordTransferPickMutation()
  const switchMutation = useSwitchTransferPickMutation()
  const escalateMutation = useEscalateTransferPickMutation()
  const returnMutation = useReturnTransferPickMutation()
  const dispatchMutation = useDispatchTransferShipmentMutation()

  const suggestion = scan.suggestion
  const maximumQuantity =
    suggestion && entryLine
      ? Math.min(suggestion.suggestedQuantity, entryLine.remainingQuantity)
      : 0
  const quantity =
    quantityOverride ??
    (suggestion && entryLine ? getDefaultPickQuantity(suggestion, entryLine) : 0)

  const watchedSwitchTarget = useWatch({ control: switchForm.control, name: 'toInventoryStockId' })
  const chosenAlternative = alternatives.find(
    (alternative) => alternative.inventoryStockId === watchedSwitchTarget
  )
  const isNonFefo = chosenAlternative ? isNonFefoChoice(chosenAlternative, alternatives) : false

  function openSwitch(line: TransferPickSheetLine, preset?: TransferPickAlternative) {
    const from = line.suggestions[0]
    switchForm.reset({
      ...EMPTY_SWITCH,
      toInventoryStockId: preset?.inventoryStockId ?? '',
      quantity: Math.max(
        0,
        Math.min(line.remainingQuantity, from?.suggestedQuantity ?? line.remainingQuantity)
      ),
      reasonCode: preset ? 'InsufficientAtLocation' : EMPTY_SWITCH.reasonCode,
    })
    setSwitchLine(line)
  }

  return {
    alternativesLoading: alternativesQuery.isLoading,
    entry: {
      line: entryLine,
      scan,
      quantity,
      maximumQuantity,
      quantityError,
      isPending: recordMutation.isPending,
      open: (line: TransferPickSheetLine) => {
        dispatchScan({ type: 'reset' })
        setQuantityOverride(null)
        setQuantityError(null)
        setEntryLine(line)
      },
      onOpenChange: (open: boolean) => !open && setEntryLine(null),
      scanSlot: (code: string) => {
        if (!entryLine) return
        setQuantityOverride(null)
        setQuantityError(null)
        dispatchScan({
          type: 'scan-slot',
          code,
          suggestions: entryLine.suggestions,
          alternatives,
          line: entryLine,
        })
      },
      scanProduct: (code: string) => {
        if (entryLine) dispatchScan({ type: 'scan-product', code, line: entryLine })
      },
      changeQuantity: (value: number) => {
        setQuantityOverride(value)
        setQuantityError(null)
      },
      rescan: () => {
        dispatchScan({ type: 'reset' })
        setQuantityOverride(null)
        setQuantityError(null)
      },
      useAlternative: (alternative: TransferPickAlternative) => {
        const line = entryLine
        setEntryLine(null)
        if (line) openSwitch(line, alternative)
      },
      confirm: async () => {
        if (!entryLine || !suggestion) return
        const problem = validatePickQuantity(quantity, maximumQuantity)
        if (problem) return setQuantityError(problem)
        const done = await run(
          () =>
            recordMutation.mutateAsync({
              transferId,
              shipmentId,
              request: {
                lineId: entryLine.lineId,
                inventoryStockId: suggestion.inventoryStockId,
                quantity,
                scannedSlotCode: scan.slotCode,
                scannedProductCode: scan.productCode || null,
              },
            }),
          `Đã ghi nhận lấy ${quantity} ${entryLine.baseUnitName} ${entryLine.sku}.`,
          'Không thể ghi nhận lấy hàng.'
        )
        if (done) setEntryLine(null)
      },
    },
    switch: {
      line: switchLine,
      form: switchForm,
      alternatives: alternatives.filter(
        (alternative) =>
          alternative.inventoryStockId !== switchLine?.suggestions[0]?.inventoryStockId
      ),
      isNonFefo,
      isPending: switchMutation.isPending,
      open: openSwitch,
      onOpenChange: (open: boolean) => !open && setSwitchLine(null),
      submit: async (values: TransferPickSwitchFormValues) => {
        const from = switchLine?.suggestions[0]
        if (!switchLine || !from) return
        const done = await run(
          () =>
            switchMutation.mutateAsync({
              transferId,
              shipmentId,
              lineId: switchLine.lineId,
              request: {
                fromInventoryStockId: from.inventoryStockId,
                toInventoryStockId: values.toInventoryStockId,
                quantity: values.quantity,
                reasonCode: values.reasonCode,
                note: values.note || null,
              },
            }),
          'Đã đổi vị trí/lô lấy hàng; giữ chỗ được chuyển sang vị trí mới.',
          'Không thể đổi vị trí/lô.'
        )
        if (done) setSwitchLine(null)
      },
    },
    escalate: {
      line: escalateLine,
      form: escalateForm,
      isPending: escalateMutation.isPending,
      open: (line: TransferPickSheetLine) => {
        escalateForm.reset(EMPTY_ESCALATE)
        setEscalateLine(line)
      },
      onOpenChange: (open: boolean) => !open && setEscalateLine(null),
      submit: async (values: TransferPickEscalateFormValues) => {
        if (!escalateLine) return
        const done = await run(
          () =>
            escalateMutation.mutateAsync({
              transferId,
              shipmentId,
              lineId: escalateLine.lineId,
              request: { reasonCode: values.reasonCode, note: values.note },
            }),
          'Đã báo quản lý. Bạn có thể tiếp tục các dòng khác.',
          'Không thể báo quản lý.'
        )
        if (done) setEscalateLine(null)
      },
    },
    returnPick: {
      line: returnLine,
      form: returnForm,
      picks: (returnLine?.picks ?? []).filter((pick) => outstandingOf(pick) > 0),
      scanError: returnScanError,
      isPending: returnMutation.isPending,
      open: (line: TransferPickSheetLine) => {
        const picks = line.picks.filter((pick) => outstandingOf(pick) > 0)
        const first = picks[0]
        returnForm.reset({
          pickDetailId: first?.id ?? '',
          quantity: first
            ? Math.min(outstandingOf(first), line.pendingReturnQuantity || outstandingOf(first))
            : 1,
          scannedSlotCode: '',
        })
        setReturnScanError(null)
        setReturnLine(line)
      },
      onOpenChange: (open: boolean) => !open && setReturnLine(null),
      scanSlot: (code: string) => {
        setReturnScanError(null)
        returnForm.setValue('scannedSlotCode', code.trim(), { shouldValidate: true })
      },
      submit: async (values: TransferPickReturnFormValues) => {
        const done = await run(
          () =>
            returnMutation.mutateAsync({
              transferId,
              shipmentId,
              request: {
                pickDetailId: values.pickDetailId,
                quantity: values.quantity,
                scannedSlotCode: values.scannedSlotCode,
              },
            }),
          'Đã trả hàng về vị trí.',
          'Không thể trả hàng về vị trí.'
        )
        if (done) setReturnLine(null)
      },
    },
    dispatch: {
      isOpen: isDispatchOpen,
      isPending: dispatchMutation.isPending,
      open: () => setIsDispatchOpen(true),
      onOpenChange: setIsDispatchOpen,
      confirm: async () => {
        if (!sheet?.version) return
        const done = await run(
          () =>
            dispatchMutation.mutateAsync({
              transferId,
              shipmentId,
              request: { expectedVersion: sheet.version ?? '' },
            }),
          'Đã xuất đợt khỏi kho; kho nhập sẽ nhận hàng.',
          'Không thể xuất đợt.'
        )
        if (done) setIsDispatchOpen(false)
      },
    },
  }
}
