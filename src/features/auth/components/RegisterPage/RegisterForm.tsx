'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/register.schema'
import type {
  BillingCycle,
  SubscriptionPlanResponse,
} from '@/features/subscription/types/subscription.types'
import {
  formatBillingCycle,
  formatCurrency,
  getBillingPeriodLabel,
  getPlanPrice,
} from '@/features/subscription/utils/format-subscription'
import { APP_ROUTES } from '@/routes/app-routes'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmPasswordHint } from './ConfirmPasswordHint'
import { PasswordRequirementList } from './PasswordRequirementList'
import { TextField } from './TextField'

interface RegisterFormProps {
  readonly onSubmit: (values: RegisterFormValues) => Promise<void>
  readonly isLoading: boolean
  readonly selectedPlan?: SubscriptionPlanResponse
  readonly selectedBillingCycle: BillingCycle
  readonly isPlanLoading: boolean
}

const defaultValues: RegisterFormValues = {
  tenantName: '',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

export function RegisterForm({
  onSubmit,
  isLoading,
  selectedPlan,
  selectedBillingCycle,
  isPlanLoading,
}: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues,
    mode: 'onTouched',
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = form

  const hasErrors = Object.keys(errors).length > 0
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (submitCount === 0 || !hasErrors) return
    const el = formRef.current
    if (!el) return
    el.classList.add('animate-shake')
    const t = setTimeout(() => el.classList.remove('animate-shake'), 450)
    return () => clearTimeout(t)
  }, [submitCount, hasErrors])

  const passwordValue = useWatch({ control, name: 'password' }) ?? ''
  const confirmPasswordValue = useWatch({ control, name: 'confirmPassword' }) ?? ''

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 w-full duration-500">
      <header className="mb-6">
        <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
          Hệ thống quản lý kho
        </p>
        <h1 className="text-foreground text-2xl leading-[1.2] font-semibold tracking-tight">
          Đăng ký tài khoản
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Cung cấp thông tin doanh nghiệp và người đại diện để khởi tạo workspace KOVIA.
        </p>
      </header>

      {isPlanLoading ? (
        <Card size="sm" className="border-border mb-5 rounded-lg">
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-48" />
          </CardContent>
        </Card>
      ) : selectedPlan ? (
        <Card size="sm" className="border-primary/30 bg-primary/5 mb-5 rounded-lg">
          <CardContent className="flex items-start gap-3">
            <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Gói đã chọn: {selectedPlan.planName}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {formatBillingCycle(selectedBillingCycle)} ·{' '}
                {getPlanPrice(selectedPlan, selectedBillingCycle) === 0
                  ? 'Miễn phí'
                  : `${formatCurrency(getPlanPrice(selectedPlan, selectedBillingCycle), selectedPlan.currency)} ${getBillingPeriodLabel(selectedBillingCycle)}`}
              </p>
              <Link
                href={APP_ROUTES.pricing}
                className="text-primary mt-2 inline-flex text-xs font-medium underline-offset-4 hover:underline"
              >
                Chọn gói khác
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <TextField
          id="tenantName"
          label="Tên doanh nghiệp / Kho hàng"
          placeholder="Warehouse Solution Vietnam"
          error={errors.tenantName?.message}
          className="md:col-span-2"
          {...register('tenantName')}
        />
        <TextField
          id="ownerName"
          label="Tên chủ sở hữu"
          placeholder="Nguyễn Văn A"
          error={errors.ownerName?.message}
          {...register('ownerName')}
        />
        <TextField
          id="phone"
          label="Số điện thoại"
          placeholder="0901234567"
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextField
          id="email"
          label="Email công việc"
          placeholder="admin@domain.com"
          type="email"
          error={errors.email?.message}
          className="md:col-span-2"
          {...register('email')}
        />
        <Field className="md:col-span-2" data-invalid={Boolean(errors.address)}>
          <FieldLabel
            htmlFor="address"
            className="text-foreground text-[11px] font-semibold tracking-[0.07em] uppercase"
          >
            Địa chỉ / Khu vực vận hành
          </FieldLabel>
          <Textarea
            id="address"
            placeholder="123 Nguyễn Huệ, TP.HCM"
            aria-invalid={Boolean(errors.address)}
            className="bg-card min-h-[80px] rounded-md px-3 py-2.5 text-sm transition-shadow"
            {...register('address')}
          />
          <FieldError>{errors.address?.message}</FieldError>
        </Field>
        <TextField
          id="password"
          label="Mật khẩu"
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Card size="sm" className="border-border bg-surface-container-low rounded-lg md:col-span-2">
          <CardContent className="text-muted-foreground space-y-2.5 text-xs leading-5">
            <PasswordRequirementList password={passwordValue} />
            <ConfirmPasswordHint password={passwordValue} confirmPassword={confirmPasswordValue} />
          </CardContent>
        </Card>

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <Field
              orientation="horizontal"
              className="items-start gap-3 md:col-span-2"
              data-invalid={Boolean(errors.acceptTerms)}
            >
              <Checkbox
                id="acceptTerms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.acceptTerms)}
                className="border-border data-checked:border-primary data-checked:bg-primary mt-0.5 rounded-sm"
              />
              <>
                <FieldLabel
                  htmlFor="acceptTerms"
                  className="text-foreground/70 block text-sm leading-5"
                >
                  Tôi đồng ý với{' '}
                  <span className="text-primary font-semibold">Điều khoản Dịch vụ</span> và{' '}
                  <span className="text-primary font-semibold">Chính sách Bảo mật</span> của KOVIA.
                </FieldLabel>
                <FieldError>{errors.acceptTerms?.message}</FieldError>
              </>
            </Field>
          )}
        />

        <div className="border-border md:col-span-2">
          <p className="text-muted-foreground mb-4 text-xs leading-5">
            Sau khi đăng ký, hệ thống sẽ gửi email xác minh có hiệu lực trong 15 phút.
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-10 w-full cursor-pointer rounded-md text-sm font-semibold transition-all active:scale-[0.98] md:w-auto md:min-w-40"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              'Tạo tài khoản'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
