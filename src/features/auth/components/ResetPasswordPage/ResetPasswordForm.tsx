'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm, useWatch } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  ConfirmPasswordHint,
  PasswordRequirementList,
  BenefitsPanel,
} from '@/features/auth/components/RegisterPage'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/reset-password.schema'

interface ResetPasswordFormProps {
  readonly token?: string
  readonly onSubmit: (values: ResetPasswordFormValues) => Promise<void>
  readonly isLoading: boolean
  readonly isSuccess: boolean
  readonly errorMessage?: string
}

export function ResetPasswordForm({
  token,
  onSubmit,
  isLoading,
  isSuccess,
  errorMessage,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const passwordValue = useWatch({ control, name: 'password' }) ?? ''
  const confirmPasswordValue = useWatch({ control, name: 'confirmPassword' }) ?? ''
  const hasErrors = Object.keys(errors).length > 0
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (submitCount === 0 || !hasErrors) return
    const element = formRef.current
    if (!element) return
    element.classList.add('animate-shake')
    const timer = setTimeout(() => element.classList.remove('animate-shake'), 450)
    return () => clearTimeout(timer)
  }, [submitCount, hasErrors])

  return (
    <div className="flex min-h-dvh min-w-0">
      <aside className="sticky top-0 hidden h-dvh flex-shrink-0 lg:block lg:w-[42%] xl:w-[45%]">
        <BenefitsPanel />
      </aside>

      <motion.div
        className="bg-background flex min-w-0 flex-1 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
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
          <div className="animate-in fade-in slide-in-from-bottom-3 w-full max-w-md duration-500">
            <header className="mb-8">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
                Bảo mật tài khoản
              </p>
              <h1 className="text-foreground text-2xl leading-[1.2] font-semibold tracking-tight">
                Đặt lại mật khẩu
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Tạo mật khẩu mới mạnh hơn để tiếp tục sử dụng KOVIA.
              </p>
            </header>

            {!token ? (
              <div className="space-y-5">
                <Alert variant="destructive">
                  <KeyRound className="mt-0.5 size-4" aria-hidden="true" />
                  <AlertTitle>Link đặt lại mật khẩu không hợp lệ</AlertTitle>
                  <AlertDescription>
                    Link thiếu mã xác thực. Vui lòng yêu cầu gửi lại email đặt mật khẩu.
                  </AlertDescription>
                </Alert>
                <Button asChild size="auth" className="w-full">
                  <Link href={APP_ROUTES.auth.forgotPassword}>Gửi lại email</Link>
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="space-y-5">
                <Alert className="border-primary-container bg-card">
                  <ShieldCheck className="text-primary mt-0.5 size-4" aria-hidden="true" />
                  <AlertTitle>Mật khẩu đã được cập nhật</AlertTitle>
                  <AlertDescription>
                    Bạn sẽ được chuyển về trang đăng nhập trong giây lát.
                  </AlertDescription>
                </Alert>
                <Button asChild size="auth" className="w-full">
                  <Link href={APP_ROUTES.auth.login}>Đến trang đăng nhập</Link>
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {errorMessage && (
                  <Alert variant="destructive">
                    <KeyRound className="mt-0.5 size-4" aria-hidden="true" />
                    <AlertTitle>Không thể đặt lại mật khẩu</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel
                    htmlFor="password"
                    className="text-foreground text-[11px] font-semibold tracking-[0.07em] uppercase"
                  >
                    Mật khẩu mới
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={Boolean(errors.password)}
                      autoComplete="new-password"
                      className="bg-card h-10 rounded-md pr-10 pl-3 text-sm transition-shadow"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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

                <div className="text-muted-foreground border-border bg-card rounded-md border p-3 text-xs">
                  <PasswordRequirementList password={passwordValue} />
                </div>

                <Field data-invalid={Boolean(errors.confirmPassword)}>
                  <FieldLabel
                    htmlFor="confirmPassword"
                    className="text-foreground text-[11px] font-semibold tracking-[0.07em] uppercase"
                  >
                    Xác nhận mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      autoComplete="new-password"
                      className="bg-card h-10 rounded-md pr-10 pl-3 text-sm transition-shadow"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                      aria-label={
                        showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <ConfirmPasswordHint
                    password={passwordValue}
                    confirmPassword={confirmPasswordValue}
                  />
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </Field>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="auth"
                  className="w-full cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    'Cập nhật mật khẩu'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
