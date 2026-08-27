'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  History,
  LockKeyhole,
  RotateCcw,
  Save,
  Send,
  SlidersHorizontal,
} from 'lucide-react'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { APP_ROUTES } from '@/routes/app-routes'
import type { CycleCountDetail } from '../types/cycle-count.types'
import type { RecountFormValues, StockAdjustmentFormValues } from '../schemas/cycle-count.schema'
import { formatCount, formatCycleCountDate } from '../utils/cycle-count-format'
import { CycleCountStatusBadge, StockAdjustmentStatusBadge } from './CycleCountStatusBadge'

interface Props {
  readonly detail: CycleCountDetail
  readonly allowedActions: readonly string[]
  readonly isPending: boolean
  readonly canCreateAdjustment: boolean
  readonly recountForm: UseFormReturn<RecountFormValues>
  readonly adjustmentForm: UseFormReturn<StockAdjustmentFormValues>
  readonly onRecord: (itemId: string, quantity: number) => Promise<void>
  readonly onSubmit: () => Promise<void>
  readonly onRecount: (itemIds: string[], reason: string) => Promise<boolean>
  readonly onFinalize: () => Promise<void>
  readonly onCreateAdjustment: (itemId: string, reason: string) => Promise<boolean>
}

export function CycleCountDetailView({
  detail,
  allowedActions,
  isPending,
  canCreateAdjustment,
  recountForm,
  adjustmentForm,
  onRecord,
  onSubmit,
  onRecount,
  onFinalize,
  onCreateAdjustment,
}: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const selected = recountForm.watch('itemIds')
  const [dialog, setDialog] = useState<'recount' | 'adjustment' | null>(null)
  const canRecord = allowedActions.includes('Record')
  const countable = detail.items.filter(
    (item) => detail.status !== 'Recount' || item.requestedRecountRound === detail.recountRound
  )
  const allCounted =
    countable.length > 0 && countable.every((item) => item.countedQuantity !== null)
  async function confirmDialog() {
    if (dialog === 'recount')
      await recountForm.handleSubmit(async (values) => {
        if (await onRecount(values.itemIds, values.reason.trim())) {
          recountForm.reset({ itemIds: [], reason: '' })
          setDialog(null)
        }
      })()
    else if (dialog === 'adjustment')
      await adjustmentForm.handleSubmit(async (values) => {
        if (await onCreateAdjustment(values.cycleCountItemId, values.reason.trim())) {
          adjustmentForm.reset({ cycleCountItemId: '', reason: '' })
          setDialog(null)
        }
      })()
  }
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href={APP_ROUTES.cycleCounts} aria-label="Quay lại">
              <ArrowLeft />
            </Link>
          </Button>
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <ClipboardCheck />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Phiếu kiểm kê</p>
            <h1 className="text-xl font-semibold">{detail.warehouseName}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {detail.zoneName || 'Toàn kho'} · vòng đếm {detail.recountRound + 1}
            </p>
          </div>
        </div>
        <CycleCountStatusBadge status={detail.status} />
      </header>
      <section className="bg-border grid shrink-0 gap-px border sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Lịch kiểm kê', formatCycleCountDate(detail.scheduledDate)],
          ['Phụ trách', detail.assignedToName || 'Chưa phân công'],
          ['Phương thức', detail.isBlindCount ? 'Blind count' : 'Hiện tồn hệ thống'],
          [
            'Tiến độ',
            `${detail.items.filter((i) => i.countedQuantity !== null).length}/${detail.items.length} dòng`,
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-3">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
          </div>
        ))}
      </section>
      <section className="bg-card flex min-h-0 flex-1 flex-col border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
          <div>
            <h2 className="text-sm font-semibold">Kết quả kiểm đếm</h2>
            <p className="text-muted-foreground text-xs">
              Theo dõi số đếm, chênh lệch và lịch sử từng vòng kiểm kê.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allowedActions.includes('Submit') ? (
              <Button disabled={!allCounted || isPending} onClick={() => void onSubmit()}>
                <Send />
                Gửi kết quả
              </Button>
            ) : null}
            {allowedActions.includes('RequestRecount') ? (
              <Button
                variant="outline"
                disabled={!selected.length || isPending}
                onClick={() => setDialog('recount')}
              >
                <RotateCcw />
                Yêu cầu đếm lại ({selected.length})
              </Button>
            ) : null}
            {allowedActions.includes('Finalize') ? (
              <Button disabled={isPending} onClick={() => void onFinalize()}>
                <CheckCircle2 />
                Hoàn tất kiểm kê
              </Button>
            ) : null}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <Table className="min-w-[1050px] table-fixed">
            <TableHeader>
              <TableRow>
                {allowedActions.includes('RequestRecount') ? (
                  <TableHead className="bg-card sticky top-0 w-12" />
                ) : null}
                <TableHead className="bg-card sticky top-0 w-64">Sản phẩm</TableHead>
                <TableHead className="bg-card sticky top-0 w-28">Slot</TableHead>
                <TableHead className="bg-card sticky top-0 w-36 text-right">Tồn hệ thống</TableHead>
                <TableHead className="bg-card sticky top-0 w-52 text-right">Số đếm</TableHead>
                <TableHead className="bg-card sticky top-0 w-32 text-right">Chênh lệch</TableHead>
                <TableHead className="bg-card sticky top-0 w-48">Lịch sử</TableHead>
                <TableHead className="bg-card sticky top-0 w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.items.map((item) => {
                const recordable =
                  canRecord &&
                  (detail.status !== 'Recount' ||
                    item.requestedRecountRound === detail.recountRound)
                const value =
                  drafts[item.id] ??
                  (item.countedQuantity === null ? '' : String(item.countedQuantity))
                return (
                  <TableRow key={item.id}>
                    {allowedActions.includes('RequestRecount') ? (
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onCheckedChange={(checked) =>
                            recountForm.setValue(
                              'itemIds',
                              checked
                                ? [...selected, item.id]
                                : selected.filter((id) => id !== item.id),
                              { shouldValidate: true }
                            )
                          }
                        />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <p className="truncate font-medium">{item.productName}</p>
                      <p className="text-muted-foreground font-mono text-xs">{item.productSku}</p>
                    </TableCell>
                    <TableCell className="font-mono">{item.slotCode}</TableCell>
                    <TableCell className="text-right font-mono">
                      {item.systemQuantity === null ? (
                        <span className="text-muted-foreground inline-flex items-center gap-1">
                          <LockKeyhole className="size-3" />
                          Đã ẩn
                        </span>
                      ) : (
                        formatCount(item.systemQuantity)
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Input
                          className="h-8 w-28 text-right font-mono"
                          type="number"
                          min="0"
                          step="0.001"
                          value={value}
                          disabled={!recordable || isPending}
                          onChange={(e) =>
                            setDrafts((current) => ({ ...current, [item.id]: e.target.value }))
                          }
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8"
                          disabled={!recordable || value === '' || Number(value) < 0 || isPending}
                          onClick={() => void onRecord(item.id, Number(value))}
                          aria-label="Lưu số đếm"
                        >
                          <Save />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono font-semibold ${item.difference && item.difference !== 0 ? 'text-destructive' : ''}`}
                    >
                      {formatCount(item.difference)}
                    </TableCell>
                    <TableCell>
                      {item.countHistory.length ? (
                        <details>
                          <summary className="text-primary cursor-pointer text-xs">
                            <History className="mr-1 inline size-3" />
                            {item.countHistory.length} lần trước
                          </summary>
                          <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                            {item.countHistory.map((h) => (
                              <p key={h.id}>
                                Vòng {h.recountRound + 1}: <b>{formatCount(h.countedQuantity)}</b> ·{' '}
                                {h.recountReason}
                              </p>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <span className="text-muted-foreground text-xs">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.activeAdjustmentId && item.activeAdjustmentStatus ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={APP_ROUTES.stockAdjustmentDetail(item.activeAdjustmentId)}>
                            <StockAdjustmentStatusBadge status={item.activeAdjustmentStatus} />
                            Xem điều chỉnh
                          </Link>
                        </Button>
                      ) : detail.status === 'Completed' &&
                        item.difference !== null &&
                        item.difference !== 0 &&
                        canCreateAdjustment ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            adjustmentForm.reset({ cycleCountItemId: item.id, reason: '' })
                            setDialog('adjustment')
                          }}
                        >
                          <SlidersHorizontal />
                          Tạo điều chỉnh
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === 'recount' ? 'Yêu cầu kiểm đếm lại' : 'Tạo đề nghị điều chỉnh'}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'recount'
                ? `Các số đếm cũ của ${selected.length} dòng vẫn được giữ trong lịch sử.`
                : 'Số lượng điều chỉnh do backend tự tính từ chênh lệch kiểm kê.'}
            </DialogDescription>
          </DialogHeader>
          {dialog === 'recount' ? (
            <>
              <Textarea
                maxLength={500}
                placeholder="Nhập lý do bắt buộc"
                {...recountForm.register('reason')}
              />
              <FieldError
                errors={
                  recountForm.formState.errors.reason
                    ? [recountForm.formState.errors.reason]
                    : undefined
                }
              />
            </>
          ) : (
            <>
              <Textarea
                maxLength={255}
                placeholder="Nhập lý do bắt buộc"
                {...adjustmentForm.register('reason')}
              />
              <FieldError
                errors={
                  adjustmentForm.formState.errors.reason
                    ? [adjustmentForm.formState.errors.reason]
                    : undefined
                }
              />
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Hủy
            </Button>
            <Button disabled={isPending} onClick={() => void confirmDialog()}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
