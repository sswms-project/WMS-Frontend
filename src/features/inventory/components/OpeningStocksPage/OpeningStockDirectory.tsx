'use client'

import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { PackagePlus, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import type { CreateOpeningStockFormValues } from '../../schemas/create-opening-stock.schema'
import type {
  InventoryFilterOption,
  OpeningStockRecord,
  OpeningStockStatus,
} from '../../types/inventory.types'
import { inventoryService } from '../../services/inventory.service'
import { formatInventoryDate, formatInventoryQuantity } from '../../utils/inventory-format'
import { InventoryWorkspaceNavigation } from '../InventoryWorkspaceNavigation'

interface OpeningStockDirectoryProps {
  readonly permissions: readonly string[]
  readonly currentUserId: string | null
  readonly items: readonly OpeningStockRecord[]
  readonly page: number
  readonly pageSize: number
  readonly totalCount: number
  readonly filterWarehouseId: string
  readonly statusFilter: OpeningStockStatus | ''
  readonly dateFrom: string
  readonly dateTo: string
  readonly form: UseFormReturn<CreateOpeningStockFormValues>
  readonly warehouseOptions: readonly InventoryFilterOption[]
  readonly productOptions: readonly (InventoryFilterOption & { unitId: string; unitName: string })[]
  readonly slotOptions: readonly InventoryFilterOption[]
  readonly lotOptions: readonly InventoryFilterOption[]
  readonly areOptionsLoading: boolean
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isPending: boolean
  readonly canCreate: boolean
  readonly canApprove: boolean
  readonly onRetry: () => void
  readonly onPageChange: (page: number) => void
  readonly onFilterWarehouseChange: (value: string) => void
  readonly onStatusFilterChange: (value: OpeningStockStatus | '') => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onCreate: (
    values: CreateOpeningStockFormValues,
    lines: OpeningStockDraftLine[]
  ) => Promise<void>
  readonly onUpdate: (item: OpeningStockRecord, lines: OpeningStockDraftLine[]) => Promise<void>
  readonly onAction: (
    item: OpeningStockRecord,
    action: 'submit' | 'approve' | 'review' | 'cancel' | 'withdraw',
    decision?: 'Returned' | 'Rejected' | 'Cancelled',
    reason?: string
  ) => Promise<void>
}

export interface OpeningStockDraftLine {
  productId: string
  slotId: string
  lotId?: string
  quantity: number
  enteredUnitId: string
  enteredUnitName: string
  conversionFactor: number
  qualityStatus: 'Good' | 'Damaged'
  eligibilityStatus: 'Available' | 'ReceivingHold' | 'InspectionHold' | 'DamageHold' | 'Quarantine'
  productLabel: string
  slotLabel: string
  lotLabel?: string
}

function statusLabel(status: OpeningStockStatus) {
  return (
    {
      Draft: 'Nháp',
      PendingApproval: 'Chờ duyệt',
      Returned: 'Trả lại',
      Rejected: 'Từ chối',
      Posted: 'Đã ghi sổ',
      Cancelled: 'Đã hủy',
    } as const
  )[status]
}

export function OpeningStockDirectory(props: OpeningStockDirectoryProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState<OpeningStockRecord | null>(null)
  const [decision, setDecision] = useState<'Returned' | 'Rejected' | 'Cancelled' | 'Withdraw'>(
    'Returned'
  )
  const [reason, setReason] = useState('')
  const [draftLines, setDraftLines] = useState<OpeningStockDraftLine[]>([])
  const [editItem, setEditItem] = useState<OpeningStockRecord | null>(null)
  const [detailItem, setDetailItem] = useState<OpeningStockRecord | null>(null)
  const errors = props.form.formState.errors
  function toDraftLine(values: CreateOpeningStockFormValues): OpeningStockDraftLine {
    const selectedProduct = props.productOptions.find((option) => option.value === values.productId)
    return {
      productId: values.productId,
      slotId: values.slotId,
      ...(values.lotId ? { lotId: values.lotId } : {}),
      quantity: values.quantity,
      enteredUnitId: selectedProduct?.unitId ?? '',
      enteredUnitName: selectedProduct?.unitName ?? '',
      conversionFactor: 1,
      qualityStatus: values.qualityStatus,
      eligibilityStatus: values.eligibilityStatus,
      productLabel: selectedProduct?.label ?? values.productId,
      slotLabel:
        props.slotOptions.find((option) => option.value === values.slotId)?.label ?? values.slotId,
      ...(values.lotId
        ? {
            lotLabel:
              props.lotOptions.find((option) => option.value === values.lotId)?.label ??
              values.lotId,
          }
        : {}),
    }
  }
  function resetLineFields() {
    props.form.setValue('productId', '')
    props.form.setValue('slotId', '')
    props.form.setValue('lotId', '')
    props.form.setValue('quantity', 1)
    props.form.setValue('qualityStatus', 'Good')
    props.form.setValue('eligibilityStatus', 'Available')
  }
  async function addLine() {
    const valid = await props.form.trigger([
      'productId',
      'slotId',
      'lotId',
      'quantity',
      'qualityStatus',
      'eligibilityStatus',
    ])
    if (!valid) return
    const values = props.form.getValues()
    const line = toDraftLine(values)
    const duplicate = draftLines.some(
      (item) =>
        item.productId === line.productId &&
        item.slotId === line.slotId &&
        item.lotId === line.lotId &&
        item.qualityStatus === line.qualityStatus &&
        item.eligibilityStatus === line.eligibilityStatus
    )
    if (duplicate) {
      props.form.setError('productId', { message: 'Phạm vi tồn kho này đã có trong chứng từ.' })
      return
    }
    setDraftLines((current) => [...current, line])
    resetLineFields()
  }
  async function create(values: CreateOpeningStockFormValues) {
    const lines = [...draftLines, toDraftLine(values)]
    await props.onCreate(values, lines)
    setDraftLines([])
    setCreateOpen(false)
  }
  async function createDraft() {
    if (editItem) {
      if (draftLines.length === 0) return
      await props.onUpdate(editItem, draftLines)
      setDraftLines([])
      setEditItem(null)
      setCreateOpen(false)
      return
    }
    if (draftLines.length === 0) {
      await props.form.handleSubmit(create)()
      return
    }
    const commonFieldsValid = await props.form.trigger(['warehouseId', 'evidenceFile'])
    if (!commonFieldsValid) return
    await props.onCreate(props.form.getValues(), draftLines)
    setDraftLines([])
    setCreateOpen(false)
  }
  function openCreate() {
    setEditItem(null)
    setDraftLines([])
    props.form.reset({
      warehouseId: '',
      productId: '',
      slotId: '',
      lotId: '',
      quantity: 1,
      qualityStatus: 'Good',
      eligibilityStatus: 'Available',
    })
    setCreateOpen(true)
  }
  function openEdit(item: OpeningStockRecord) {
    setEditItem(item)
    setDraftLines(
      item.lines.map((line) => ({
        productId: line.productId,
        slotId: line.slotId,
        ...(line.lotId ? { lotId: line.lotId } : {}),
        quantity: line.quantity,
        enteredUnitId: line.enteredUnitId,
        enteredUnitName: line.enteredUnitName,
        conversionFactor: line.conversionFactorSnapshot,
        qualityStatus: line.qualityStatus === 'Damaged' ? 'Damaged' : 'Good',
        eligibilityStatus: line.eligibilityStatus,
        productLabel: `${line.sku} · ${line.productName}`,
        slotLabel: line.slotCode,
        ...(line.lotNumber ? { lotLabel: line.lotNumber } : {}),
      }))
    )
    props.form.reset({
      warehouseId: item.warehouseId,
      productId: '',
      slotId: '',
      lotId: '',
      quantity: 1,
      qualityStatus: 'Good',
      eligibilityStatus: 'Available',
    })
    setCreateOpen(true)
  }
  async function review() {
    if (!reviewItem) return
    if (decision === 'Withdraw') await props.onAction(reviewItem, 'withdraw', undefined, reason)
    else
      await props.onAction(
        reviewItem,
        decision === 'Cancelled' ? 'cancel' : 'review',
        decision,
        reason
      )
    setReviewItem(null)
    setReason('')
  }
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b pb-4">
        <div className="flex gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <PackagePlus />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="text-xl font-semibold">Chứng từ tồn đầu</h1>
            <p className="text-muted-foreground text-sm">
              Maker-checker, ghi sổ một lần và chống trùng phạm vi.
            </p>
          </div>
        </div>
        {props.canCreate ? <Button onClick={openCreate}>Tạo chứng từ</Button> : null}
      </header>
      <InventoryWorkspaceNavigation currentView="opening-stocks" permissions={props.permissions} />
      <section className="bg-card flex min-h-0 flex-col border">
        <div className="grid gap-3 border-b p-3 sm:grid-cols-4">
          <NativeSelect
            aria-label="Lọc theo kho"
            value={props.filterWarehouseId}
            onChange={(event) => props.onFilterWarehouseChange(event.target.value)}
          >
            <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
            {props.warehouseOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Lọc theo trạng thái"
            value={props.statusFilter}
            onChange={(event) =>
              props.onStatusFilterChange(event.target.value as OpeningStockStatus | '')
            }
          >
            <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
            <NativeSelectOption value="Draft">Nháp</NativeSelectOption>
            <NativeSelectOption value="PendingApproval">Chờ duyệt</NativeSelectOption>
            <NativeSelectOption value="Returned">Trả lại</NativeSelectOption>
            <NativeSelectOption value="Rejected">Từ chối</NativeSelectOption>
            <NativeSelectOption value="Posted">Đã ghi sổ</NativeSelectOption>
            <NativeSelectOption value="Cancelled">Đã hủy</NativeSelectOption>
          </NativeSelect>
          <Input
            aria-label="Từ ngày"
            type="date"
            value={props.dateFrom}
            onChange={(event) => props.onDateFromChange(event.target.value)}
          />
          <Input
            aria-label="Đến ngày"
            type="date"
            value={props.dateTo}
            min={props.dateFrom || undefined}
            onChange={(event) => props.onDateToChange(event.target.value)}
          />
        </div>
        {props.isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : props.isError ? (
          <OperationalErrorState title="Không thể tải chứng từ tồn đầu" onRetry={props.onRetry} />
        ) : props.items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có chứng từ tồn đầu"
            description="Tạo chứng từ từ kết quả kiểm đếm ban đầu."
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-card sticky top-0">Chứng từ</TableHead>
                  <TableHead className="bg-card sticky top-0">Kho</TableHead>
                  <TableHead className="bg-card sticky top-0">Dòng hàng</TableHead>
                  <TableHead className="bg-card sticky top-0">Bằng chứng</TableHead>
                  <TableHead className="bg-card sticky top-0">Trạng thái</TableHead>
                  <TableHead className="bg-card sticky top-0">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-mono font-medium">{item.code}</p>
                      <p className="text-muted-foreground text-xs">
                        v{item.revision} · {formatInventoryDate(item.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>
                      {item.lines.map((line) => (
                        <p key={line.id} className="text-xs">
                          {line.sku} · {line.slotCode} ·{' '}
                          {formatInventoryQuantity(line.enteredQuantity)} {line.enteredUnitName}
                        </p>
                      ))}
                    </TableCell>
                    <TableCell className="max-w-48">
                      {item.evidence.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          className="text-primary block max-w-full truncate text-left underline"
                          onClick={() =>
                            void inventoryService.downloadEvidence(file.id, file.fileName)
                          }
                        >
                          {file.fileName}
                        </button>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{statusLabel(item.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setDetailItem(item)}>
                          Chi tiết
                        </Button>
                        {(item.status === 'Draft' || item.status === 'Returned') &&
                        props.canCreate &&
                        (item.createdByUserId === props.currentUserId ||
                          item.submittedByUserId === props.currentUserId) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={props.isPending}
                            onClick={() => openEdit(item)}
                          >
                            Sửa
                          </Button>
                        ) : null}
                        {(item.status === 'Draft' || item.status === 'Returned') &&
                        props.canCreate ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={props.isPending}
                            onClick={() => void props.onAction(item, 'submit')}
                          >
                            Gửi duyệt
                          </Button>
                        ) : null}
                        {item.status === 'PendingApproval' &&
                        props.canApprove &&
                        item.createdByUserId !== props.currentUserId &&
                        item.submittedByUserId !== props.currentUserId ? (
                          <Button
                            size="sm"
                            disabled={props.isPending}
                            onClick={() => void props.onAction(item, 'approve')}
                          >
                            Duyệt & ghi sổ
                          </Button>
                        ) : null}
                        {item.status === 'PendingApproval' &&
                        props.canApprove &&
                        item.createdByUserId !== props.currentUserId &&
                        item.submittedByUserId !== props.currentUserId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDecision('Returned')
                              setReviewItem(item)
                            }}
                          >
                            Phản hồi
                          </Button>
                        ) : null}
                        {item.status === 'PendingApproval' &&
                        props.canCreate &&
                        (item.createdByUserId === props.currentUserId ||
                          item.submittedByUserId === props.currentUserId) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDecision('Withdraw')
                              setReviewItem(item)
                            }}
                          >
                            Rút lại
                          </Button>
                        ) : null}
                        {['Draft', 'PendingApproval'].includes(item.status) &&
                        props.canCreate &&
                        (item.createdByUserId === props.currentUserId ||
                          item.submittedByUserId === props.currentUserId) ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDecision('Cancelled')
                              setReviewItem(item)
                            }}
                          >
                            Hủy
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <OperationalPagination
          page={props.page}
          pageSize={props.pageSize}
          totalCount={props.totalCount}
          isPending={props.isLoading}
          onPageChange={props.onPageChange}
        />
      </section>
      <Dialog
        open={Boolean(detailItem)}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailItem?.code}</DialogTitle>
            <DialogDescription>Chi tiết chứng từ và các mốc xử lý đã ghi nhận.</DialogDescription>
          </DialogHeader>
          {detailItem ? (
            <div className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <p>
                  <strong>Kho:</strong> {detailItem.warehouseName}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {statusLabel(detailItem.status)}
                </p>
                {detailItem.decisionReason ? (
                  <p>
                    <strong>Lý do quyết định:</strong> {detailItem.decisionReason}
                  </p>
                ) : null}
              </div>
              <div className="border">
                <p className="border-b px-3 py-2 font-medium">Các dòng tồn đầu</p>
                {detailItem.lines.map((line) => (
                  <p key={line.id} className="border-b px-3 py-2 last:border-b-0">
                    {line.sku} · {line.productName} · {line.slotCode}
                    {line.lotNumber ? ` · lô ${line.lotNumber}` : ''} · nhập{' '}
                    {formatInventoryQuantity(line.enteredQuantity)} {line.enteredUnitName} ×{' '}
                    {line.conversionFactorSnapshot} = {formatInventoryQuantity(line.baseQuantity)}{' '}
                    đơn vị cơ sở · {line.qualityStatus}/{line.eligibilityStatus}
                  </p>
                ))}
              </div>
              <div>
                <p className="font-medium">Lịch sử trạng thái</p>
                <p>
                  Đã tạo bởi {detailItem.createdByName} ·{' '}
                  {formatInventoryDate(detailItem.createdAt)}
                </p>
                {detailItem.submittedAt ? (
                  <p>Đã gửi duyệt · {formatInventoryDate(detailItem.submittedAt)}</p>
                ) : null}
                {detailItem.approvedAt ? (
                  <p>Đã ghi sổ · {formatInventoryDate(detailItem.approvedAt)}</p>
                ) : null}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailItem(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setDraftLines([])
            setEditItem(null)
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editItem ? `Sửa ${editItem.code}` : 'Tạo chứng từ tồn đầu'}</DialogTitle>
            <DialogDescription>
              Thêm các dòng kiểm đếm thuộc cùng một kho trước khi lưu chứng từ.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={props.form.handleSubmit(create)}>
            {(
              [
                ['warehouseId', 'Kho', props.warehouseOptions, 'Chọn kho'],
                ['productId', 'Sản phẩm', props.productOptions, 'Chọn sản phẩm'],
                [
                  'slotId',
                  'Vị trí',
                  props.slotOptions,
                  props.form.watch('warehouseId') ? 'Chọn vị trí' : 'Chọn kho trước',
                ],
                [
                  'lotId',
                  'Lô (không bắt buộc)',
                  props.lotOptions,
                  props.form.watch('productId') ? 'Không chọn lô' : 'Chọn sản phẩm trước',
                ],
              ] as const
            ).map(([name, label, options, placeholder]) => (
              <Field key={name} data-invalid={Boolean(errors[name])}>
                <FieldLabel htmlFor={`opening-${name}`}>{label}</FieldLabel>
                <NativeSelect
                  id={`opening-${name}`}
                  disabled={
                    props.areOptionsLoading ||
                    (name === 'warehouseId' && Boolean(editItem)) ||
                    (name === 'slotId' && !props.form.watch('warehouseId')) ||
                    (name === 'lotId' && !props.form.watch('productId'))
                  }
                  {...props.form.register(name)}
                >
                  <NativeSelectOption value="">{placeholder}</NativeSelectOption>
                  {options.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError errors={errors[name] ? [errors[name]] : undefined} />
              </Field>
            ))}
            <Field data-invalid={Boolean(errors.quantity)}>
              <FieldLabel htmlFor="opening-quantity">
                Số lượng (
                {props.productOptions.find(
                  (option) => option.value === props.form.watch('productId')
                )?.unitName ?? 'đơn vị cơ sở'}
                )
              </FieldLabel>
              <Input
                id="opening-quantity"
                type="number"
                step="0.01"
                {...props.form.register('quantity', { valueAsNumber: true })}
              />
              <FieldError errors={errors.quantity ? [errors.quantity] : undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor="opening-quality">Tình trạng vật lý</FieldLabel>
              <NativeSelect id="opening-quality" {...props.form.register('qualityStatus')}>
                <NativeSelectOption value="Good">Đạt</NativeSelectOption>
                <NativeSelectOption value="Damaged">Hư hỏng</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="opening-eligibility">Điều kiện sử dụng</FieldLabel>
              <NativeSelect id="opening-eligibility" {...props.form.register('eligibilityStatus')}>
                <NativeSelectOption value="Available">Khả dụng</NativeSelectOption>
                <NativeSelectOption value="ReceivingHold">Giữ khi nhận</NativeSelectOption>
                <NativeSelectOption value="InspectionHold">Chờ kiểm tra</NativeSelectOption>
                <NativeSelectOption value="DamageHold">Giữ do hỏng</NativeSelectOption>
                <NativeSelectOption value="Quarantine">Cách ly</NativeSelectOption>
              </NativeSelect>
            </Field>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => void addLine()}>
                <Plus aria-hidden="true" />
                Thêm dòng và nhập tiếp
              </Button>
            </div>
            {draftLines.length > 0 ? (
              <div className="border">
                <div className="border-b px-3 py-2 text-sm font-medium">
                  Dòng đã thêm ({draftLines.length})
                </div>
                {draftLines.map((line, index) => (
                  <div
                    key={`${line.productId}-${line.slotId}-${line.lotId ?? 'none'}-${index}`}
                    className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{line.productLabel}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {line.slotLabel}
                        {line.lotLabel ? ` · ${line.lotLabel}` : ''} ·{' '}
                        {formatInventoryQuantity(line.quantity)} {line.enteredUnitName} ·{' '}
                        {line.qualityStatus}/{line.eligibilityStatus}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Xóa dòng ${index + 1}`}
                      onClick={() =>
                        setDraftLines((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
            {!editItem ? (
              <Field data-invalid={Boolean(errors.evidenceFile)}>
                <FieldLabel htmlFor="opening-evidence">Tệp bằng chứng kiểm đếm</FieldLabel>
                <Input
                  id="opening-evidence"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file)
                      props.form.setValue('evidenceFile', file, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    else props.form.resetField('evidenceFile')
                  }}
                />
                <FieldError errors={errors.evidenceFile ? [errors.evidenceFile] : undefined} />
              </Field>
            ) : (
              <p className="text-muted-foreground text-xs">
                Bằng chứng đã đính kèm được giữ nguyên khi sửa các dòng kiểm đếm.
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateOpen(false)
                  setDraftLines([])
                  setEditItem(null)
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={props.isPending || (Boolean(editItem) && draftLines.length === 0)}
                onClick={() => void createDraft()}
              >
                {props.isPending
                  ? 'Đang lưu...'
                  : editItem
                    ? `Lưu ${draftLines.length} dòng`
                    : `Tạo nháp (${Math.max(1, draftLines.length)} dòng)`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(reviewItem)}
        onOpenChange={(open) => {
          if (!open) setReviewItem(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === 'Cancelled'
                ? 'Hủy chứng từ'
                : decision === 'Withdraw'
                  ? 'Rút lại chứng từ'
                  : 'Phản hồi chứng từ'}
            </DialogTitle>
            <DialogDescription>Ghi rõ lý do để lưu vào lịch sử nghiệp vụ.</DialogDescription>
          </DialogHeader>
          {decision !== 'Cancelled' && decision !== 'Withdraw' ? (
            <Field>
              <FieldLabel htmlFor="opening-decision">Quyết định</FieldLabel>
              <NativeSelect
                id="opening-decision"
                value={decision}
                onChange={(event) =>
                  setDecision(event.target.value === 'Rejected' ? 'Rejected' : 'Returned')
                }
              >
                <NativeSelectOption value="Returned">Trả lại</NativeSelectOption>
                <NativeSelectOption value="Rejected">Từ chối</NativeSelectOption>
              </NativeSelect>
            </Field>
          ) : null}
          <Field>
            <FieldLabel htmlFor="opening-reason">Lý do</FieldLabel>
            <Textarea
              id="opening-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewItem(null)}>
              Đóng
            </Button>
            <Button disabled={!reason.trim() || props.isPending} onClick={() => void review()}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
