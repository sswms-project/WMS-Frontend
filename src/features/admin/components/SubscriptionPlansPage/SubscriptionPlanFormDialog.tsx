'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Controller, useForm, type DefaultValues, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApiErrorResponse } from '@/types/api'
import {
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
} from '../../hooks/use-admin'
import {
  createSubscriptionPlanSchema,
  editSubscriptionPlanSchema,
  type SubscriptionPlanFormInput,
  type SubscriptionPlanFormOutput,
} from '../../schemas/subscription-plan.schema'
import type {
  SubscriptionPlanResponse,
  UpdateSubscriptionPlanRequest,
} from '../../types/admin.types'
import {
  isDuplicatePlanNameError,
  mapServerFieldErrors,
  type SubscriptionPlanFormField,
} from './subscription-plan-errors'

const BILLING_CYCLE_LABELS = {
  Monthly: 'Hàng tháng',
  Yearly: 'Hàng năm',
} as const

const FEATURE_FIELDS = [
  { name: 'enableForecasting', label: 'Dự báo nhu cầu' },
  { name: 'enableBarcode', label: 'Mã vạch / QR' },
  { name: 'enableLayoutDesigner', label: 'Thiết kế layout kho' },
] as const

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

// Edit không nhận billingCycle: lỗi validation cho field đó (nếu có) sẽ không gắn được
// vào form nào nên bỏ khỏi danh sách map.
const EDIT_FIELDS: readonly SubscriptionPlanFormField[] = CREATE_FIELDS.filter(
  (field) => field !== 'billingCycle'
)

interface SubscriptionPlanFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** Có giá trị = chế độ sửa; bỏ trống = chế độ tạo mới. */
  readonly plan?: SubscriptionPlanResponse
}

function buildCreateDefaults(): DefaultValues<SubscriptionPlanFormInput> {
  return {
    planName: '',
    price: '',
    billingCycle: undefined,
    maxWarehouses: '',
    maxUsers: '',
    enableForecasting: false,
    enableBarcode: false,
    enableLayoutDesigner: false,
  }
}

function buildEditDefaults(
  plan: SubscriptionPlanResponse
): DefaultValues<SubscriptionPlanFormInput> {
  return {
    planName: plan.planName,
    price: plan.price,
    billingCycle: plan.billingCycle,
    maxWarehouses: plan.maxWarehouses,
    maxUsers: plan.maxUsers,
    enableForecasting: plan.enableForecasting,
    enableBarcode: plan.enableBarcode,
    enableLayoutDesigner: plan.enableLayoutDesigner,
  }
}

export function SubscriptionPlanFormDialog({
  open,
  onOpenChange,
  plan,
}: SubscriptionPlanFormDialogProps) {
  const isEditMode = plan !== undefined
  const createMutation = useCreateSubscriptionPlanMutation()
  const updateMutation = useUpdateSubscriptionPlanMutation()
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<SubscriptionPlanFormInput, unknown, SubscriptionPlanFormOutput>({
    // Hai chế độ dùng hai schema khác nhau vì backend Update không nhận billingCycle.
    // Cần ép kiểu vì schema sửa có ít field hơn schema tạo trong khi form dùng chung
    // một kiểu giá trị; ở chế độ sửa billingCycle chỉ để hiển thị và không bao giờ
    // được đọc ra khi dựng payload cập nhật.
    resolver: zodResolver(
      isEditMode ? editSubscriptionPlanSchema : createSubscriptionPlanSchema
    ) as unknown as Resolver<SubscriptionPlanFormInput, unknown, SubscriptionPlanFormOutput>,
    defaultValues: plan ? buildEditDefaults(plan) : buildCreateDefaults(),
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return

    if (nextOpen) {
      reset(plan ? buildEditDefaults(plan) : buildCreateDefaults())
    } else {
      reset(plan ? buildEditDefaults(plan) : buildCreateDefaults())
      createMutation.reset()
      updateMutation.reset()
    }

    onOpenChange(nextOpen)
  }

  function applyServerErrors(error: ApiErrorResponse): boolean {
    const fieldErrors = mapServerFieldErrors(error, isEditMode ? EDIT_FIELDS : CREATE_FIELDS)
    for (const fieldError of fieldErrors) {
      setError(fieldError.field, { type: 'server', message: fieldError.message })
    }
    return fieldErrors.length > 0
  }

  function handleSubmitError(error: ApiErrorResponse) {
    // Chỉ Create mới có bước kiểm tra trùng tên ở backend.
    if (!isEditMode && isDuplicatePlanNameError(error)) {
      setError('planName', { type: 'server', message: 'Tên gói đã tồn tại.' })
      return
    }

    if (applyServerErrors(error)) return

    toast.error(error.message ?? 'Không thể lưu gói đăng ký. Vui lòng thử lại.')
  }

  function buildUpdatePayload(values: SubscriptionPlanFormOutput): UpdateSubscriptionPlanRequest {
    // Dựa vào dirtyFields chứ không phải giá trị: kiểm tra truthy sẽ bỏ sót các
    // checkbox đổi từ true sang false.
    const payload: UpdateSubscriptionPlanRequest = {}
    if (dirtyFields.planName) payload.planName = values.planName
    if (dirtyFields.price) payload.price = values.price
    if (dirtyFields.maxWarehouses) payload.maxWarehouses = values.maxWarehouses
    if (dirtyFields.maxUsers) payload.maxUsers = values.maxUsers
    if (dirtyFields.enableForecasting) payload.enableForecasting = values.enableForecasting
    if (dirtyFields.enableBarcode) payload.enableBarcode = values.enableBarcode
    if (dirtyFields.enableLayoutDesigner) {
      payload.enableLayoutDesigner = values.enableLayoutDesigner
    }
    return payload
  }

  async function handleSave(values: SubscriptionPlanFormOutput) {
    try {
      if (plan) {
        const payload = buildUpdatePayload(values)
        if (Object.keys(payload).length === 0) {
          onOpenChange(false)
          return
        }
        await updateMutation.mutateAsync({ id: plan.id, body: payload })
        toast.success('Đã lưu thay đổi.')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Đã tạo gói đăng ký.')
      }
      handleOpenChange(false)
    } catch (error) {
      // Giữ dialog mở để người dùng sửa lại dữ liệu vừa nhập.
      handleSubmitError(error as ApiErrorResponse)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        // Form nhiều field nên có thể cao hơn màn hình thấp; DialogContent căn giữa
        // bằng translate nên nếu không giới hạn chiều cao thì phần tràn bị cắt và
        // không cuộn tới được.
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isPending) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Sửa gói đăng ký' : 'Tạo gói đăng ký'}</DialogTitle>
          <DialogDescription>
            Thiết lập giá, chu kỳ thanh toán và giới hạn sử dụng cho gói đăng ký.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Field data-invalid={Boolean(errors.planName)}>
            <FieldLabel htmlFor="planName">Tên gói</FieldLabel>
            <Input
              id="planName"
              aria-invalid={Boolean(errors.planName)}
              autoComplete="off"
              {...register('planName')}
            />
            <FieldError>{errors.planName?.message}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.price)}>
              <FieldLabel htmlFor="price">Giá</FieldLabel>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.price)}
                {...register('price')}
              />
              <FieldError>{errors.price?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.billingCycle)}>
              <FieldLabel htmlFor="billingCycle">Chu kỳ thanh toán</FieldLabel>
              <Controller
                control={control}
                name="billingCycle"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditMode}>
                    <SelectTrigger id="billingCycle" aria-invalid={Boolean(errors.billingCycle)}>
                      <SelectValue placeholder="Chọn chu kỳ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {isEditMode && (
                <FieldDescription>Không thể đổi chu kỳ sau khi tạo gói.</FieldDescription>
              )}
              <FieldError>{errors.billingCycle?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.maxWarehouses)}>
              <FieldLabel htmlFor="maxWarehouses">Số kho tối đa</FieldLabel>
              <Input
                id="maxWarehouses"
                type="number"
                min="1"
                step="1"
                aria-invalid={Boolean(errors.maxWarehouses)}
                {...register('maxWarehouses')}
              />
              <FieldError>{errors.maxWarehouses?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.maxUsers)}>
              <FieldLabel htmlFor="maxUsers">Số người dùng tối đa</FieldLabel>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                step="1"
                aria-invalid={Boolean(errors.maxUsers)}
                {...register('maxUsers')}
              />
              <FieldError>{errors.maxUsers?.message}</FieldError>
            </Field>
          </div>

          <fieldset className="space-y-2.5">
            <legend className="text-foreground mb-2 text-xs font-medium">Tính năng đi kèm</legend>
            {FEATURE_FIELDS.map((feature) => (
              <div key={feature.name} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={feature.name}
                  render={({ field }) => (
                    <Checkbox
                      id={feature.name}
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  )}
                />
                <Label htmlFor={feature.name} className="cursor-pointer text-xs font-normal">
                  {feature.label}
                </Label>
              </div>
            ))}
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending || (isEditMode && !isDirty)}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : isEditMode ? (
                'Lưu thay đổi'
              ) : (
                'Tạo gói'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
