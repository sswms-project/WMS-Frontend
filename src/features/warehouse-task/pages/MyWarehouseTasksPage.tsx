'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import {
  useInventoryQuery,
  useInventoryWarehouseOptionsQuery,
} from '@/features/inventory/hooks/use-inventory'
import { useStaffListQuery } from '@/features/staff/hooks/use-staff'
import { STAFF_DIRECTORY_KINDS } from '@/features/staff/types/staff.types'
import { useWarehouseLocationsQuery } from '@/features/warehouse/hooks/use-warehouse'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  CreateRelocationTaskDialog,
  RelocationTaskDialog,
  WarehouseTaskDirectory,
} from '../components/WarehouseTaskDirectory'
import {
  useAssignWarehouseTaskMutation,
  useCreateWarehouseTaskMutation,
  useExecuteWarehouseRelocationMutation,
  useManageMyWarehouseTaskMutation,
  useMyWarehouseTasksQuery,
  useWarehouseTaskDetailQuery,
  useWarehouseTaskRecommendationsQuery,
} from '../hooks/use-warehouse-task'
import {
  createWarehouseRelocationSchema,
  executeWarehouseRelocationSchema,
  type CreateWarehouseRelocationFormValues,
  type ExecuteWarehouseRelocationFormValues,
} from '../schemas/warehouse-relocation.schema'
import type { MyWarehouseTask, WarehouseTaskAction } from '../types/warehouse-task.types'

const PAGE_SIZE = 20
const EMPTY_LINE = {
  sourceInventoryStockId: '',
  sourceSlotId: '',
  availableQuantity: 0,
  quantity: 1,
  proposedDestinationSlotId: null,
}
const SUCCESS_MESSAGES: Record<WarehouseTaskAction, string> = {
  Start: 'Đã bắt đầu công việc.',
  Pause: 'Đã tạm dừng công việc.',
  Return: 'Đã trả công việc về cho quản lý kho.',
}

export default function MyWarehouseTasksPage() {
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [sourceSearch, setSourceSearch] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [assignmentStaffId, setAssignmentStaffId] = useState('')
  const [assignmentReason, setAssignmentReason] = useState('')
  const [pendingReason, setPendingReason] = useState<{
    task: MyWarehouseTask
    action: 'Pause' | 'Return'
  } | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const meQuery = useMeQuery()
  const permissions = meQuery.data?.permissions ?? []
  const canManageOwnTasks = permissions.includes(P.WAREHOUSE_TASKS_MANAGE_OWN)
  const managesWarehouseTasks = permissions.includes(P.WAREHOUSE_TASKS_VIEW_ALL)
  const canCreateRelocation = permissions.includes(P.WAREHOUSE_TASKS_CREATE)
  const canAssignRelocation = permissions.includes(P.WAREHOUSE_TASKS_ASSIGN)
  const scope = managesWarehouseTasks ? 'managed' : 'mine'
  const query = useMyWarehouseTasksQuery({ pageNumber: page, pageSize: PAGE_SIZE }, scope)
  const action = useManageMyWarehouseTaskMutation()
  const detailQuery = useWarehouseTaskDetailQuery(selectedTaskId, scope)
  const createMutation = useCreateWarehouseTaskMutation()
  const assignMutation = useAssignWarehouseTaskMutation(selectedTaskId)
  const executeMutation = useExecuteWarehouseRelocationMutation(selectedTaskId)

  const createForm = useForm<CreateWarehouseRelocationFormValues>({
    resolver: zodResolver(createWarehouseRelocationSchema),
    defaultValues: {
      warehouseId: '',
      priority: 'Normal',
      dueAt: '',
      reason: '',
      lines: [{ ...EMPTY_LINE }],
    },
  })
  const createLines = useFieldArray({ control: createForm.control, name: 'lines' })
  const createWarehouseId = useWatch({ control: createForm.control, name: 'warehouseId' })
  const debouncedSourceSearch = useDebouncedValue(sourceSearch, 350)
  const warehouseOptionsQuery = useInventoryWarehouseOptionsQuery(canCreateRelocation)
  const inventoryQuery = useInventoryQuery(
    {
      pageNumber: 1,
      pageSize: 100,
      warehouseId: createWarehouseId || undefined,
      searchTerm: debouncedSourceSearch.trim() || undefined,
    },
    canCreateRelocation && Boolean(createWarehouseId)
  )
  const locationQuery = useWarehouseLocationsQuery(createWarehouseId, {
    top: 300,
    skip: 0,
    needTotalCount: true,
    type: 'Slot',
    lifecycleStatus: 'Active',
  })
  const inventoryOptions = useMemo(
    () =>
      (inventoryQuery.data?.items ?? []).filter(
        (stock) =>
          stock.availableQuantity > 0 &&
          stock.qualityStatus === 'Good' &&
          stock.eligibilityStatus === 'Available'
      ),
    [inventoryQuery.data?.items]
  )

  const executeForm = useForm<ExecuteWarehouseRelocationFormValues>({
    resolver: zodResolver(executeWarehouseRelocationSchema),
    defaultValues: { lineId: '', destinationSlotId: '', quantity: 1, overrideReason: '' },
  })
  const executeLineId = useWatch({ control: executeForm.control, name: 'lineId' })
  const executeQuantity = useWatch({ control: executeForm.control, name: 'quantity' })
  const recommendationsQuery = useWarehouseTaskRecommendationsQuery(
    selectedTaskId,
    executeLineId || null,
    executeQuantity,
    scope,
    Boolean(detailQuery.data)
  )
  const staffQuery = useStaffListQuery(
    STAFF_DIRECTORY_KINDS.staff,
    { top: 100, skip: 0, needTotalCount: true },
    canAssignRelocation && Boolean(selectedTaskId)
  )
  const managerQuery = useStaffListQuery(
    STAFF_DIRECTORY_KINDS.managers,
    { top: 100, skip: 0, needTotalCount: true },
    canAssignRelocation && Boolean(selectedTaskId)
  )
  const assignableStaff = useMemo(() => {
    const warehouseId = detailQuery.data?.warehouseId
    const candidates = [...(staffQuery.data?.items ?? []), ...(managerQuery.data?.items ?? [])]
    return candidates.filter(
      (staff, index) =>
        staff.status === 'Active' &&
        Boolean(warehouseId && staff.assignedWarehouseIds.includes(warehouseId)) &&
        candidates.findIndex((candidate) => candidate.id === staff.id) === index
    )
  }, [detailQuery.data?.warehouseId, managerQuery.data?.items, staffQuery.data?.items])

  useEffect(() => {
    const detail = detailQuery.data
    if (!detail) return
    const firstPendingLine = detail.lines.find((line) => line.remainingQuantity > 0)
    executeForm.reset({
      lineId: firstPendingLine?.id ?? '',
      destinationSlotId: firstPendingLine?.proposedDestinationSlotId ?? '',
      quantity: firstPendingLine?.remainingQuantity ?? 1,
      overrideReason: '',
    })
  }, [detailQuery.data, executeForm])

  async function run(task: MyWarehouseTask, type: WarehouseTaskAction, note?: string) {
    try {
      await action.mutateAsync({
        taskType: task.taskType,
        taskId: task.id,
        action: type,
        reason: note,
      })
      toast.success(SUCCESS_MESSAGES[type])
      if (task.taskType === 'Relocation' && selectedTaskId === task.id) await detailQuery.refetch()
      return true
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật công việc. Vui lòng thử lại.'))
      return false
    }
  }

  function manage(task: MyWarehouseTask, type: WarehouseTaskAction) {
    if (type === 'Start') {
      void run(task, type)
      return
    }
    setReason('')
    setReasonError('')
    setPendingReason({ task, action: type })
  }

  async function confirmReason() {
    if (!pendingReason) return
    const normalized = reason.trim()
    if (!normalized) {
      setReasonError('Vui lòng nhập lý do.')
      return
    }
    if (normalized.length > 500) {
      setReasonError('Lý do không được vượt quá 500 ký tự.')
      return
    }
    if (await run(pendingReason.task, pendingReason.action, normalized)) setPendingReason(null)
  }

  function changeCreateWarehouse(warehouseId: string) {
    createForm.setValue('warehouseId', warehouseId, { shouldValidate: true })
    createForm.setValue('lines', [{ ...EMPTY_LINE }])
    setSourceSearch('')
  }

  function changeSource(index: number, stockId: string) {
    const stock = inventoryOptions.find((item) => item.id === stockId)
    createForm.setValue(`lines.${index}.sourceInventoryStockId`, stockId, { shouldValidate: true })
    createForm.setValue(`lines.${index}.sourceSlotId`, stock?.slotId ?? '')
    createForm.setValue(`lines.${index}.availableQuantity`, stock?.availableQuantity ?? 0)
    createForm.setValue(`lines.${index}.quantity`, stock ? Math.min(1, stock.availableQuantity) : 1)
    createForm.setValue(`lines.${index}.proposedDestinationSlotId`, null)
  }

  async function createRelocation(values: CreateWarehouseRelocationFormValues) {
    try {
      await createMutation.mutateAsync({
        warehouseId: values.warehouseId,
        priority: values.priority,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
        reason: values.reason.trim(),
        commandId: crypto.randomUUID(),
        lines: values.lines.map((line) => ({
          sourceInventoryStockId: line.sourceInventoryStockId,
          quantity: line.quantity,
          proposedDestinationSlotId: line.proposedDestinationSlotId || null,
        })),
      })
      toast.success('Đã tạo công việc điều chuyển vị trí.')
      setCreateOpen(false)
      createForm.reset({
        warehouseId: '',
        priority: 'Normal',
        dueAt: '',
        reason: '',
        lines: [{ ...EMPTY_LINE }],
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tạo công việc điều chuyển.'))
    }
  }

  async function assignRelocation() {
    const detail = detailQuery.data
    const targetStaffId = assignmentStaffId || detail?.assignedTo
    if (!detail || !targetStaffId) return
    if (detail.assignedTo && detail.assignedTo !== targetStaffId && !assignmentReason.trim()) {
      toast.error('Vui lòng nhập lý do khi phân công lại.')
      return
    }
    try {
      await assignMutation.mutateAsync({
        staffId: targetStaffId,
        expectedStaffId: detail.assignedTo,
        expectedVersion: detail.rowVersion,
        reason: assignmentReason.trim() || null,
      })
      toast.success(detail.assignedTo ? 'Đã phân công lại công việc.' : 'Đã phân công công việc.')
      await detailQuery.refetch()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể phân công công việc.'))
    }
  }

  function changeExecuteLine(lineId: string) {
    const line = detailQuery.data?.lines.find((item) => item.id === lineId)
    executeForm.reset({
      lineId,
      destinationSlotId: line?.proposedDestinationSlotId ?? '',
      quantity: line?.remainingQuantity ?? 1,
      overrideReason: '',
    })
  }

  async function executeRelocation(values: ExecuteWarehouseRelocationFormValues) {
    const detail = detailQuery.data
    if (!detail) return
    const line = detail.lines.find((item) => item.id === values.lineId)
    const recommendation = recommendationsQuery.data?.find(
      (item) => item.slotId === values.destinationSlotId
    )
    if (
      recommendation?.rank !== 1 &&
      values.destinationSlotId !== line?.proposedDestinationSlotId &&
      !values.overrideReason.trim()
    ) {
      executeForm.setError('overrideReason', {
        message: 'Vui lòng nêu lý do khi không chọn vị trí ưu tiên số 1.',
      })
      return
    }
    try {
      await executeMutation.mutateAsync({
        lineId: values.lineId,
        destinationSlotId: values.destinationSlotId,
        quantity: values.quantity,
        commandId: crypto.randomUUID(),
        expectedVersion: detail.rowVersion,
        overrideReason: values.overrideReason.trim() || null,
      })
      toast.success('Đã ghi nhận điều chuyển vị trí.')
      await detailQuery.refetch()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể ghi nhận điều chuyển.'))
    }
  }

  return (
    <>
      <WarehouseTaskDirectory
        title={managesWarehouseTasks ? 'Công việc kho' : 'Công việc của tôi'}
        description={
          managesWarehouseTasks
            ? 'Theo dõi, tạo và phân công công việc trong các kho được quản lý.'
            : 'Chỉ hiển thị các nhiệm vụ kho được giao cho bạn. Mỗi lúc chỉ làm một việc.'
        }
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        currentUserId={meQuery.data?.id}
        headerAction={
          canCreateRelocation ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" /> Tạo task điều chuyển
            </Button>
          ) : null
        }
        onPageChange={setPage}
        onRetry={() => void query.refetch()}
        canManage={canManageOwnTasks}
        onAction={manage}
        onOpenRelocation={(task) => setSelectedTaskId(task.id)}
      />
      <CreateRelocationTaskDialog
        open={createOpen}
        form={createForm}
        fields={createLines.fields}
        warehouseOptions={warehouseOptionsQuery.data ?? []}
        inventoryOptions={inventoryOptions}
        slotOptions={locationQuery.data?.items ?? []}
        sourceSearch={sourceSearch}
        isPending={createMutation.isPending}
        onOpenChange={setCreateOpen}
        onWarehouseChange={changeCreateWarehouse}
        onSourceChange={changeSource}
        onSourceSearchChange={setSourceSearch}
        onAddLine={() => createLines.append({ ...EMPTY_LINE })}
        onRemoveLine={createLines.remove}
        onSubmit={(values) => void createRelocation(values)}
      />
      <RelocationTaskDialog
        open={Boolean(selectedTaskId)}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        scope={scope}
        canAssign={canAssignRelocation}
        canExecute={canManageOwnTasks && detailQuery.data?.assignedTo === meQuery.data?.id}
        staffOptions={assignableStaff}
        assignmentStaffId={assignmentStaffId || detailQuery.data?.assignedTo || ''}
        assignmentReason={assignmentReason}
        recommendations={recommendationsQuery.data ?? []}
        recommendationsLoading={recommendationsQuery.isLoading}
        executeForm={executeForm}
        isAssigning={assignMutation.isPending}
        isExecuting={executeMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskId(null)
            setAssignmentStaffId('')
            setAssignmentReason('')
          }
        }}
        onRetry={() => void detailQuery.refetch()}
        onAssignmentStaffChange={setAssignmentStaffId}
        onAssignmentReasonChange={setAssignmentReason}
        onAssign={() => void assignRelocation()}
        onLineChange={changeExecuteLine}
        onExecute={(values) => void executeRelocation(values)}
      />
      <Dialog
        open={Boolean(pendingReason)}
        onOpenChange={(open) => !open && !action.isPending && setPendingReason(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingReason?.action === 'Pause' ? 'Tạm dừng công việc' : 'Trả lại công việc'}
            </DialogTitle>
            <DialogDescription>
              {pendingReason?.action === 'Pause'
                ? 'Công việc vẫn thuộc về bạn và có thể tiếp tục sau.'
                : 'Công việc sẽ trở về trạng thái chưa giao để quản lý kho giao cho người khác.'}{' '}
              <span className="font-mono">{pendingReason?.task.referenceCode}</span>
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(reasonError)}>
            <FieldLabel htmlFor="warehouse-task-reason">Lý do</FieldLabel>
            <Textarea
              id="warehouse-task-reason"
              rows={3}
              maxLength={500}
              value={reason}
              aria-invalid={Boolean(reasonError)}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError('')
              }}
            />
            <FieldError>{reasonError}</FieldError>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={action.isPending}
              onClick={() => setPendingReason(null)}
            >
              Hủy
            </Button>
            <Button type="button" disabled={action.isPending} onClick={() => void confirmReason()}>
              {action.isPending ? 'Đang lưu…' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
