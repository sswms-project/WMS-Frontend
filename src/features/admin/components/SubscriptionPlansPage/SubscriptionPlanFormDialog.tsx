'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PackagePlus, SlidersHorizontal, WalletCards } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { SubscriptionFeatureMetaResponse } from '@/features/subscription/types/subscription.types'
import {
  createSubscriptionPlanSchema,
  type FeatureItemInput,
  type SubscriptionPlanFormInput,
  type SubscriptionPlanFormOutput,
} from '../../schemas/subscription-plan.schema'
import type { SubscriptionPlanResponse } from '../../types/admin.types'

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
  readonly featureMeta: readonly SubscriptionFeatureMetaResponse[]
  /** Có giá trị = chế độ sửa; bỏ trống = chế độ tạo mới. */
  readonly plan?: SubscriptionPlanResponse
}

function buildFeatureItems(
  meta: readonly SubscriptionFeatureMetaResponse[],
  plan?: SubscriptionPlanResponse
): FeatureItemInput[] {
  return meta.map((feature) => {
    const existing = plan?.features.find((f) => f.featureCode === feature.code)
    return {
      featureCode: feature.code,
      featureType: feature.type,
      displayName: feature.name,
      description: feature.description,
      enabled: existing !== undefined,
      limitValue: existing?.limitValue ?? '',
    }
  })
}

function buildDefaults(
  meta: readonly SubscriptionFeatureMetaResponse[],
  plan?: SubscriptionPlanResponse
): DefaultValues<SubscriptionPlanFormInput> {
  if (plan) {
    return {
      planName: plan.planName,
      monthlyPrice: plan.monthlyPrice,
      yearlyDiscountPercent: plan.yearlyDiscountPercent,
      displayOrder: plan.displayOrder,
      featureItems: buildFeatureItems(meta, plan),
    }
  }
  return {
    planName: '',
    monthlyPrice: '',
    yearlyDiscountPercent: 0,
    displayOrder: '',
    featureItems: buildFeatureItems(meta),
  }
}

export function SubscriptionPlanFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  featureMeta,
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
    resolver: zodResolver(createSubscriptionPlanSchema),
    defaultValues: buildDefaults(featureMeta, plan),
  })

  const { fields } = useFieldArray({ control, name: 'featureItems' })
  const watchedFeatureItems = useWatch({ control, name: 'featureItems' })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) return
    reset(buildDefaults(featureMeta, nextOpen ? plan : undefined))
    onOpenChange(nextOpen)
  }

  async function handleValidSubmit(values: SubscriptionPlanFormOutput) {
    const shouldClose = await onSubmit(values, { dirtyFields, setError })
    if (shouldClose) handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
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
                ? 'Điều chỉnh giá, chiết khấu và tính năng của gói.'
                : 'Cấu hình giá, chiết khấu năm và tính năng cho gói mới.'}
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
              <Field data-invalid={Boolean(errors.monthlyPrice)}>
                <FieldLabel htmlFor="monthlyPrice">Giá tháng</FieldLabel>
                <InputGroup className="h-11 sm:h-8">
                  <InputGroupInput
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    aria-invalid={Boolean(errors.monthlyPrice)}
                    {...register('monthlyPrice')}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>VND</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.monthlyPrice?.message}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.yearlyDiscountPercent)}>
                <FieldLabel htmlFor="yearlyDiscountPercent">Chiết khấu năm (%)</FieldLabel>
                <InputGroup className="h-11 sm:h-8">
                  <InputGroupInput
                    id="yearlyDiscountPercent"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    aria-invalid={Boolean(errors.yearlyDiscountPercent)}
                    {...register('yearlyDiscountPercent')}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.yearlyDiscountPercent?.message}</FieldError>
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.displayOrder)}>
              <FieldLabel htmlFor="displayOrder">Thứ tự hiển thị</FieldLabel>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                step="1"
                className="h-11 sm:h-8"
                aria-invalid={Boolean(errors.displayOrder)}
                {...register('displayOrder')}
              />
              <FieldError>{errors.displayOrder?.message}</FieldError>
            </Field>
          </section>

          {fields.length > 0 && (
            <fieldset className="border">
              <legend className="text-foreground mx-2 px-1 text-xs font-semibold">
                Tính năng đi kèm
              </legend>
              {fields.map((field, index) => {
                const isEnabled = watchedFeatureItems[index]?.enabled ?? false
                const isLimit = field.featureType === 'Limit'
                const limitError = errors.featureItems?.[index]?.limitValue

                return (
                  <div key={field.id} className="border-b px-3 py-2.5 last:border-b-0">
                    <div className="flex min-h-10 items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <Label
                          htmlFor={`feature-${field.featureCode}`}
                          className="cursor-pointer text-xs font-medium"
                        >
                          {field.displayName}
                        </Label>
                        {field.description && (
                          <p className="text-muted-foreground mt-0.5 text-[11px] leading-4">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <Controller
                        control={control}
                        name={`featureItems.${index}.enabled`}
                        render={({ field: switchField }) => (
                          <Switch
                            id={`feature-${field.featureCode}`}
                            checked={switchField.value}
                            onCheckedChange={(checked) => switchField.onChange(checked === true)}
                          />
                        )}
                      />
                    </div>
                    {isLimit && isEnabled && (
                      <div className="mt-2">
                        <Field data-invalid={Boolean(limitError)}>
                          <FieldLabel
                            htmlFor={`feature-limit-${field.featureCode}`}
                            className="sr-only"
                          >
                            Giới hạn {field.displayName}
                          </FieldLabel>
                          <Input
                            id={`feature-limit-${field.featureCode}`}
                            type="number"
                            min="1"
                            step="1"
                            className="h-8 w-40"
                            placeholder="Nhập giới hạn…"
                            aria-invalid={Boolean(limitError)}
                            {...register(`featureItems.${index}.limitValue`)}
                          />
                          <FieldError>{limitError?.message}</FieldError>
                        </Field>
                      </div>
                    )}
                  </div>
                )
              })}
            </fieldset>
          )}

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
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
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
