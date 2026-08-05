'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  LayoutGrid,
  Loader2,
  PackagePlus,
  ScanBarcode,
  SlidersHorizontal,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import {
  Controller,
  useForm,
  type DefaultValues,
  type FormState,
  type UseFormSetError,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  createSubscriptionPlanSchema,
  editSubscriptionPlanSchema,
  type SubscriptionPlanFormInput,
  type SubscriptionPlanFormOutput,
} from '../../schemas/subscription-plan.schema'
import type { SubscriptionPlanResponse } from '../../types/admin.types'

const BILLING_CYCLE_LABELS = {
  Monthly: 'Hàng tháng',
  Yearly: 'Hàng năm',
} as const

const FEATURE_FIELDS = [
  {
    name: 'enableForecasting',
    label: 'Dự báo nhu cầu',
    description: 'Phân tích xu hướng và hỗ trợ lập kế hoạch tồn kho.',
    icon: TrendingUp,
  },
  {
    name: 'enableBarcode',
    label: 'Mã vạch / QR',
    description: 'Quét và định danh hàng hóa trong quy trình vận hành.',
    icon: ScanBarcode,
  },
  {
    name: 'enableLayoutDesigner',
    label: 'Thiết kế layout kho',
    description: 'Thiết kế sơ đồ vị trí và khu vực lưu trữ.',
    icon: LayoutGrid,
  },
] as const

export interface SubscriptionPlanFormSubmitContext {
  readonly dirtyFields: FormState<SubscriptionPlanFormInput>['dirtyFields']
  readonly setError: UseFormSetError<SubscriptionPlanFormInput>
}

interface SubscriptionPlanFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (
    values: SubscriptionPlanFormOutput,
    context: SubscriptionPlanFormSubmitContext
  ) => Promise<boolean>
  readonly isPending: boolean
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
  onSubmit,
  isPending,
  plan,
}: SubscriptionPlanFormDialogProps) {
  const isEditMode = plan !== undefined

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<SubscriptionPlanFormInput, unknown, SubscriptionPlanFormOutput>({
    resolver: isEditMode
      ? zodResolver(editSubscriptionPlanSchema)
      : zodResolver(createSubscriptionPlanSchema),
    defaultValues: plan ? buildEditDefaults(plan) : buildCreateDefaults(),
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return

    if (nextOpen) {
      reset(plan ? buildEditDefaults(plan) : buildCreateDefaults())
    } else {
      reset(plan ? buildEditDefaults(plan) : buildCreateDefaults())
    }

    onOpenChange(nextOpen)
  }

  async function handleValidSubmit(values: SubscriptionPlanFormOutput) {
    const shouldClose = await onSubmit(values, { dirtyFields, setError })
    if (shouldClose) handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        // Form nhiều field nên có thể cao hơn màn hình thấp; DialogContent căn giữa
        // bằng translate nên nếu không giới hạn chiều cao thì phần tràn bị cắt và
        // không cuộn tới được.
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto duration-200 sm:max-w-xl"
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
        <div className="flex items-start gap-3 border-b pb-3">
          <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center">
            {isEditMode ? (
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            ) : (
              <PackagePlus className="size-4" aria-hidden="true" />
            )}
          </div>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Sửa gói đăng ký' : 'Tạo gói đăng ký'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Điều chỉnh giá, giới hạn và tính năng. Chu kỳ thanh toán được giữ nguyên.'
                : 'Cấu hình giá, chu kỳ và quyền sử dụng cho gói mới.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5">
          <section className="space-y-3" aria-labelledby="plan-commercial-information">
            <div className="flex items-center gap-2 border-b pb-2">
              <WalletCards className="text-primary size-4" aria-hidden="true" />
              <h3
                id="plan-commercial-information"
                className="text-foreground text-xs font-semibold"
              >
                Thông tin thương mại
              </h3>
            </div>

            <Field data-invalid={Boolean(errors.planName)}>
              <FieldLabel htmlFor="planName">Tên gói</FieldLabel>
              <Input
                id="planName"
                className="h-11 sm:h-8"
                aria-invalid={Boolean(errors.planName)}
                autoComplete="off"
                {...register('planName')}
              />
              <FieldError>{errors.planName?.message}</FieldError>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.price)}>
                <FieldLabel htmlFor="price">Giá</FieldLabel>
                <InputGroup className="h-11 sm:h-8">
                  <InputGroupInput
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    aria-invalid={Boolean(errors.price)}
                    {...register('price')}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>VND</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.price?.message}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.billingCycle)}>
                <FieldLabel htmlFor="billingCycle">Chu kỳ thanh toán</FieldLabel>
                <Controller
                  control={control}
                  name="billingCycle"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEditMode}
                    >
                      <SelectTrigger
                        id="billingCycle"
                        className="h-11 sm:h-8"
                        aria-invalid={Boolean(errors.billingCycle)}
                      >
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
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="plan-usage-limits">
            <div className="flex items-center gap-2 border-b pb-2">
              <SlidersHorizontal className="text-primary size-4" aria-hidden="true" />
              <h3 id="plan-usage-limits" className="text-foreground text-xs font-semibold">
                Giới hạn sử dụng
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.maxWarehouses)}>
                <FieldLabel htmlFor="maxWarehouses">Số kho tối đa</FieldLabel>
                <Input
                  id="maxWarehouses"
                  type="number"
                  min="1"
                  step="1"
                  className="h-11 sm:h-8"
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
                  className="h-11 sm:h-8"
                  aria-invalid={Boolean(errors.maxUsers)}
                  {...register('maxUsers')}
                />
                <FieldError>{errors.maxUsers?.message}</FieldError>
              </Field>
            </div>
          </section>

          <fieldset className="border">
            <legend className="text-foreground mx-2 px-1 text-xs font-semibold">
              Tính năng đi kèm
            </legend>
            {FEATURE_FIELDS.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.name}
                  className="flex min-h-14 items-center gap-3 border-b px-3 py-2 last:border-b-0"
                >
                  <div className="text-primary bg-primary/8 flex size-8 shrink-0 items-center justify-center">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={feature.name} className="cursor-pointer text-xs font-medium">
                      {feature.label}
                    </Label>
                    <p
                      id={`${feature.name}-description`}
                      className="text-muted-foreground mt-0.5 text-[11px] leading-4"
                    >
                      {feature.description}
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name={feature.name}
                    render={({ field }) => (
                      <Switch
                        id={feature.name}
                        checked={field.value}
                        aria-describedby={`${feature.name}-description`}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    )}
                  />
                </div>
              )
            })}
          </fieldset>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 sm:h-8"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              className="h-10 sm:h-8"
              disabled={isPending || (isEditMode && !isDirty)}
            >
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
