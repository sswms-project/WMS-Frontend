'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  UserRoundPlus,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { BenefitsPanel } from '@/features/auth/components/RegisterPage'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  acceptInvitationSchema,
  acceptInvitationPasswordRequirements,
  type AcceptInvitationFormValues,
} from '../../schemas/invitation.schema'

interface AcceptInvitationFormProps {
  readonly token?: string
  readonly isLoading: boolean
  readonly isSuccess: boolean
  readonly errorMessage?: string
  readonly onSubmit: (values: AcceptInvitationFormValues) => Promise<void>
}

export function AcceptInvitationForm({
  token,
  isLoading,
  isSuccess,
  errorMessage,
  onSubmit,
}: AcceptInvitationFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { fullName: '', password: '', confirmPassword: '' },
  })
  const passwordValue = useWatch({ control, name: 'password' }) ?? ''

  return (
    <div className="flex min-h-dvh min-w-0">
      <aside className="sticky top-0 hidden h-dvh shrink-0 lg:block lg:w-[42%] xl:w-[45%]">
        <BenefitsPanel logoHref={APP_ROUTES.home} />
      </aside>

      <motion.main
        className="bg-background flex min-w-0 flex-1 flex-col"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-12">
          <Logo className="lg:hidden" />
          <Link
            href={APP_ROUTES.auth.login}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Đăng nhập
          </Link>
        </header>

        <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-12 xl:px-16">
          <div className="animate-in fade-in slide-in-from-bottom-3 w-full max-w-md duration-300 motion-reduce:animate-none">
            <header className="mb-8">
              <p className="text-primary mb-2 text-xs font-medium">Lời mời tham gia KOVIA</p>
              <h1 className="text-foreground text-2xl leading-tight font-semibold">
                Hoàn tất tài khoản
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Điền thông tin cá nhân để bắt đầu làm việc cùng tổ chức của bạn.
              </p>
            </header>

            {!token ? (
              <div className="space-y-5">
                <Alert variant="destructive">
                  <KeyRound className="size-4" aria-hidden="true" />
                  <AlertTitle>Link lời mời không hợp lệ</AlertTitle>
                  <AlertDescription>
                    Link thiếu mã xác thực. Hãy liên hệ người đã mời bạn.
                  </AlertDescription>
                </Alert>
                <Button asChild variant="outline" className="w-full">
                  <Link href={APP_ROUTES.auth.login}>Về trang đăng nhập</Link>
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="space-y-5">
                <Alert className="border-primary/40 bg-primary/5">
                  <CheckCircle2 className="text-primary size-4" aria-hidden="true" />
                  <AlertTitle>Tài khoản đã sẵn sàng</AlertTitle>
                  <AlertDescription>Bạn có thể đăng nhập bằng email nhận lời mời.</AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href={APP_ROUTES.auth.login}>Đăng nhập ngay</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {errorMessage && (
                  <Alert variant="destructive">
                    <UserRoundPlus className="size-4" aria-hidden="true" />
                    <AlertTitle>Không thể hoàn tất tài khoản</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={Boolean(errors.fullName)}>
                  <FieldLabel htmlFor="invitation-full-name">Họ và tên</FieldLabel>
                  <Input
                    id="invitation-full-name"
                    autoComplete="name"
                    autoFocus
                    maxLength={255}
                    aria-invalid={Boolean(errors.fullName)}
                    className="h-11"
                    {...register('fullName')}
                  />
                  <FieldError>{errors.fullName?.message}</FieldError>
                </Field>

                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="invitation-password">Mật khẩu</FieldLabel>
                  <div className="relative">
                    <Input
                      id="invitation-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      className="h-11 pr-11"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <FieldError>{errors.password?.message}</FieldError>
                </Field>

                <div
                  className="text-muted-foreground border-border bg-card rounded-md border p-3 text-xs"
                  aria-live="polite"
                >
                  <p className="text-foreground mb-2 font-semibold">Mật khẩu cần đáp ứng:</p>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {acceptInvitationPasswordRequirements.map((requirement) => {
                      const isMet = requirement.validate(passwordValue)
                      const RequirementIcon = isMet ? CheckCircle2 : Circle

                      return (
                        <li
                          key={requirement.id}
                          className={cn('flex items-center gap-2', isMet && 'text-primary')}
                        >
                          <RequirementIcon className="size-3.5 shrink-0" aria-hidden="true" />
                          <span>{requirement.label}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <Field data-invalid={Boolean(errors.confirmPassword)}>
                  <FieldLabel htmlFor="invitation-confirm-password">Xác nhận mật khẩu</FieldLabel>
                  <div className="relative">
                    <Input
                      id="invitation-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className="h-11 pr-11"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={
                        showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'
                      }
                      onClick={() => setShowConfirmPassword((value) => !value)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </Field>

                <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle
                      className="size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <UserRoundPlus className="size-4" aria-hidden="true" />
                  )}
                  Hoàn tất tài khoản
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  )
}
