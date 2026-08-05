'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import {
  Blocks,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Layers3,
  PackageOpen,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ApiErrorResponse } from '@/types/api'
import {
  DeactivatePlanDialog,
  SubscriptionPlanTable,
  SubscriptionPlanFormDialog,
  type SubscriptionPlanFormSubmitContext,
} from '../components/SubscriptionPlansPage'
import {
  useAdminSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useDeactivateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
} from '../hooks/use-admin'
import {
  BILLING_CYCLE_API_VALUES,
  createSubscriptionPlanRequestSchema,
  updateSubscriptionPlanRequestSchema,
  type SubscriptionPlanFormOutput,
  type UpdateSubscriptionPlanRequest,
} from '../schemas/subscription-plan.schema'
import type { SubscriptionPlanResponse } from '../types/admin.types'

const CREATE_FIELDS: readonly SubscriptionPlanFormField[] = [
  'planName',
  'price',
  'billingCycle',
  'maxWarehouses',
  'maxUsers',
  'enableForecasting',
  'enableBarcode',
  'enableLayoutDesigner',
]

const UPDATE_FIELDS = [
  'planName',
  'price',
  'maxWarehouses',
  'maxUsers',
  'enableForecasting',
  'enableBarcode',
  'enableLayoutDesigner',
] as const

const SERVER_FIELD_MAP = {
  PlanName: 'planName',
  Price: 'price',
  BillingCycle: 'billingCycle',
  MaxWarehouses: 'maxWarehouses',
  MaxUsers: 'maxUsers',
  EnableForecasting: 'enableForecasting',
  EnableBarcode: 'enableBarcode',
  EnableLayoutDesigner: 'enableLayoutDesigner',
} as const

const DUPLICATE_PLAN_NAME_PREFIX = "SubscriptionPlan with value '"
const DUPLICATE_PLAN_NAME_SUFFIX = "' already exists"
const ACTIVE_SUBSCRIBERS_MESSAGE = 'Cannot delete a plan with active subscribers'
const PLAN_FEATURE_KEYS = ['enableForecasting', 'enableBarcode', 'enableLayoutDesigner'] as const

type SubscriptionPlanFormField = keyof SubscriptionPlanFormOutput

interface PlanCatalogSummaryProps {
  readonly plans?: readonly SubscriptionPlanResponse[]
  readonly isLoading: boolean
}

function PlanCatalogSummary({ plans, isLoading }: PlanCatalogSummaryProps) {
  const monthlyPlanCount = plans?.filter((plan) => plan.billingCycle === 'Monthly').length ?? 0
  const yearlyPlanCount = plans?.filter((plan) => plan.billingCycle === 'Yearly').length ?? 0
  const enabledFeatureCount = PLAN_FEATURE_KEYS.filter((feature) =>
    plans?.some((plan) => plan[feature])
  ).length
  const summaryItems = [
    { label: 'Gói đang mở', value: plans?.length ?? 0, icon: Layers3 },
    { label: 'Hàng tháng', value: monthlyPlanCount, icon: CalendarDays },
    { label: 'Hàng năm', value: yearlyPlanCount, icon: CalendarRange },
    { label: 'Nhóm tính năng', value: enabledFeatureCount, icon: Blocks },
  ]

  return (
    <div className="bg-card/60 grid grid-cols-2 border-t border-l sm:grid-cols-4">
      {summaryItems.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="flex min-h-16 items-center gap-3 border-r border-b px-3 sm:px-4"
          >
            <div className="text-primary bg-primary/8 flex size-8 shrink-0 items-center justify-center">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="mb-1.5 h-4 w-8" />
              ) : (
                <p className="text-foreground text-base font-semibold tabular-nums">{item.value}</p>
              )}
              <p className="text-muted-foreground truncate text-xs">{item.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  if (typeof error !== 'object' || error === null) return false
  if (!('statusCode' in error) || !('message' in error)) return false

  if (typeof error.statusCode !== 'number' || typeof error.message !== 'string') return false
  if (!('errors' in error) || error.errors === undefined) return true
  if (typeof error.errors !== 'object' || error.errors === null) return false

  return Object.values(error.errors).every(
    (messages) =>
      Array.isArray(messages) && messages.every((message) => typeof message === 'string')
  )
}

function isServerField(serverField: string): serverField is keyof typeof SERVER_FIELD_MAP {
  return Object.hasOwn(SERVER_FIELD_MAP, serverField)
}

function isDuplicatePlanNameError(error: ApiErrorResponse): boolean {
  return (
    error.statusCode === 409 &&
    error.message.startsWith(DUPLICATE_PLAN_NAME_PREFIX) &&
    error.message.endsWith(DUPLICATE_PLAN_NAME_SUFFIX)
  )
}

function isActiveSubscribersError(error: ApiErrorResponse): boolean {
  return error.statusCode === 409 && error.message === ACTIVE_SUBSCRIBERS_MESSAGE
}

function applyServerFieldErrors(
  error: ApiErrorResponse,
  allowedFields: readonly SubscriptionPlanFormField[],
  setError: SubscriptionPlanFormSubmitContext['setError']
): boolean {
  if (!error.errors) return false

  let hasFieldError = false
  for (const [serverField, messages] of Object.entries(error.errors)) {
    if (!isServerField(serverField)) continue

    const field = SERVER_FIELD_MAP[serverField]
    const message = messages[0]
    if (!message || !allowedFields.includes(field)) continue

    setError(field, { type: 'server', message })
    hasFieldError = true
  }

  return hasFieldError
}

export function SubscriptionPlansPage() {
  const prefersReducedMotion = useReducedMotion() === true
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanResponse | null>(null)
  const [deactivatingPlan, setDeactivatingPlan] = useState<SubscriptionPlanResponse | null>(null)
  const [deactivateErrorMessage, setDeactivateErrorMessage] = useState<string | null>(null)
  const { data: plans, isLoading, isError, isFetching, refetch } = useAdminSubscriptionPlansQuery()
  const createMutation = useCreateSubscriptionPlanMutation()
  const updateMutation = useUpdateSubscriptionPlanMutation()
  const deactivateMutation = useDeactivateSubscriptionPlanMutation()

  const isFormOpen = isCreateOpen || editingPlan !== null
  const isFormPending = createMutation.isPending || updateMutation.isPending
  const contentState = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : plans && plans.length > 0
        ? 'content'
        : 'empty'

  function openCreateDialog() {
    setEditingPlan(null)
    setIsCreateOpen(true)
  }

  function handleFormApiError(
    error: unknown,
    allowedFields: readonly SubscriptionPlanFormField[],
    setError: SubscriptionPlanFormSubmitContext['setError'],
    checkDuplicateName: boolean
  ) {
    if (!isApiErrorResponse(error)) {
      console.error(error)
      toast.error('Không thể lưu gói đăng ký. Vui lòng thử lại.')
      return
    }

    if (checkDuplicateName && isDuplicatePlanNameError(error)) {
      setError('planName', { type: 'server', message: 'Tên gói đã tồn tại.' })
      toast.error('Tên gói đã tồn tại.')
      return
    }

    if (applyServerFieldErrors(error, allowedFields, setError)) {
      toast.error('Vui lòng kiểm tra lại thông tin gói đăng ký.')
      return
    }

    toast.error(error.message || 'Không thể lưu gói đăng ký. Vui lòng thử lại.')
  }

  function buildUpdatePayload(
    values: SubscriptionPlanFormOutput,
    dirtyFields: SubscriptionPlanFormSubmitContext['dirtyFields']
  ): UpdateSubscriptionPlanRequest {
    return {
      ...(dirtyFields.planName ? { planName: values.planName } : {}),
      ...(dirtyFields.price ? { price: values.price } : {}),
      ...(dirtyFields.maxWarehouses ? { maxWarehouses: values.maxWarehouses } : {}),
      ...(dirtyFields.maxUsers ? { maxUsers: values.maxUsers } : {}),
      ...(dirtyFields.enableForecasting ? { enableForecasting: values.enableForecasting } : {}),
      ...(dirtyFields.enableBarcode ? { enableBarcode: values.enableBarcode } : {}),
      ...(dirtyFields.enableLayoutDesigner
        ? { enableLayoutDesigner: values.enableLayoutDesigner }
        : {}),
    }
  }

  async function handlePlanSubmit(
    values: SubscriptionPlanFormOutput,
    { dirtyFields, setError }: SubscriptionPlanFormSubmitContext
  ): Promise<boolean> {
    if (!editingPlan) {
      const request = createSubscriptionPlanRequestSchema.parse({
        ...values,
        billingCycle: BILLING_CYCLE_API_VALUES[values.billingCycle],
      })

      try {
        await createMutation.mutateAsync(request)
        toast.success('Đã tạo gói đăng ký.')
        return true
      } catch (error) {
        handleFormApiError(error, CREATE_FIELDS, setError, true)
        return false
      }
    }

    const parsedRequest = updateSubscriptionPlanRequestSchema.safeParse(
      buildUpdatePayload(values, dirtyFields)
    )

    if (!parsedRequest.success) {
      const fieldErrors = parsedRequest.error.flatten().fieldErrors
      for (const field of UPDATE_FIELDS) {
        const message = fieldErrors[field]?.[0]
        if (message) setError(field, { type: 'schema', message })
      }
      toast.error('Vui lòng kiểm tra lại thông tin gói đăng ký.')
      return false
    }

    if (Object.keys(parsedRequest.data).length === 0) return true

    try {
      await updateMutation.mutateAsync({ id: editingPlan.id, body: parsedRequest.data })
      toast.success('Đã lưu thay đổi.')
      return true
    } catch (error) {
      handleFormApiError(error, UPDATE_FIELDS, setError, false)
      return false
    }
  }

  function handleFormOpenChange(nextOpen: boolean) {
    if (!nextOpen && isFormPending) return
    if (nextOpen) return

    setIsCreateOpen(false)
    setEditingPlan(null)
    createMutation.reset()
    updateMutation.reset()
  }

  function handleDeactivateOpenChange(nextOpen: boolean) {
    if (!nextOpen && deactivateMutation.isPending) return
    if (nextOpen) return

    setDeactivatingPlan(null)
    setDeactivateErrorMessage(null)
    deactivateMutation.reset()
  }

  async function handleDeactivateConfirm() {
    if (!deactivatingPlan) return

    setDeactivateErrorMessage(null)
    try {
      await deactivateMutation.mutateAsync(deactivatingPlan.id)
      toast.success('Đã vô hiệu hóa gói đăng ký.')
      handleDeactivateOpenChange(false)
    } catch (error) {
      console.error(error)
      const message =
        isApiErrorResponse(error) && isActiveSubscribersError(error)
          ? 'Không thể vô hiệu hóa gói đang có tenant sử dụng.'
          : isApiErrorResponse(error)
            ? error.message
            : 'Không thể vô hiệu hóa gói. Vui lòng thử lại.'

      setDeactivateErrorMessage(message)
      toast.error(message)
    }
  }

  function renderPlans() {
    if (isLoading) {
      return (
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex h-16 items-center gap-6 px-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="hidden h-4 w-28 md:block" />
            </div>
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <PackageOpen className="text-destructive size-10" aria-hidden="true" />
          <p className="text-sm">Không thể tải danh sách gói đăng ký.</p>
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw
              className={isFetching ? 'size-4 animate-spin' : 'size-4'}
              aria-hidden="true"
            />
            Thử lại
          </Button>
        </div>
      )
    }

    if (!plans || plans.length === 0) {
      return (
        <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <div className="border-border bg-muted/50 flex size-12 items-center justify-center border">
            <PackageOpen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">Chưa có gói đăng ký</p>
            <p className="mt-1 text-xs">Tạo gói đầu tiên để mở danh mục cho tenant.</p>
          </div>
          <Button variant="outline" className="h-10 gap-1.5 sm:h-8" onClick={openCreateDialog}>
            <Plus className="size-4" aria-hidden="true" />
            Tạo gói đầu tiên
          </Button>
        </div>
      )
    }

    return (
      <SubscriptionPlanTable
        plans={plans}
        onEdit={(plan) => {
          setIsCreateOpen(false)
          setEditingPlan(plan)
        }}
        onDeactivate={(plan) => {
          setDeactivateErrorMessage(null)
          setDeactivatingPlan(plan)
        }}
      />
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary text-primary-foreground relative flex size-10 shrink-0 items-center justify-center">
            <CreditCard className="size-5" aria-hidden="true" />
            <span
              className="bg-primary-container absolute right-0.5 bottom-0.5 size-1.5"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Danh mục nền tảng</p>
            <h2 className="text-foreground mt-0.5 text-xl font-semibold">Gói đăng ký</h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
              Quản lý mức giá, giới hạn sử dụng và tính năng dành cho tenant.
            </p>
          </div>
        </div>
        <Button className="h-10 w-full gap-1.5 sm:h-8 sm:w-auto" onClick={openCreateDialog}>
          <Plus className="size-4" aria-hidden="true" />
          Tạo gói mới
        </Button>
      </header>

      {!isError && <PlanCatalogSummary plans={plans} isLoading={isLoading} />}

      <section className="bg-card border" aria-labelledby="subscription-plans-list-title">
        <div className="flex min-h-11 items-center justify-between gap-4 border-b px-3 sm:px-4">
          <div className="flex items-baseline gap-2">
            <h3
              id="subscription-plans-list-title"
              className="text-foreground text-sm font-semibold"
            >
              Danh sách gói
            </h3>
            {!isLoading && !isError && (
              <span className="text-muted-foreground text-xs">{plans?.length ?? 0} gói</span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isFetching}
                aria-label="Làm mới danh sách gói"
                onClick={() => void refetch()}
              >
                <RefreshCw
                  className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'}
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>Làm mới danh sách</TooltipContent>
          </Tooltip>
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={contentState}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {renderPlans()}
          </motion.div>
        </AnimatePresence>
      </section>

      <SubscriptionPlanFormDialog
        key={editingPlan?.id ?? 'create'}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={handlePlanSubmit}
        isPending={isFormPending}
        plan={editingPlan ?? undefined}
      />

      {deactivatingPlan && (
        <DeactivatePlanDialog
          open
          onOpenChange={handleDeactivateOpenChange}
          onConfirm={handleDeactivateConfirm}
          isPending={deactivateMutation.isPending}
          errorMessage={deactivateErrorMessage}
          plan={deactivatingPlan}
        />
      )}
    </div>
  )
}
