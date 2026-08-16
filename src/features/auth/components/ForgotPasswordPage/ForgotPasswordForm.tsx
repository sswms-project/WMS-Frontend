'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, MailCheck, Send } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { APP_ROUTES } from '@/routes/app-routes'
import { BenefitsPanel } from '@/features/auth/components/RegisterPage'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password.schema'

interface ForgotPasswordFormProps {
  readonly onSubmit: (values: ForgotPasswordFormValues) => Promise<void>
  readonly isLoading: boolean
  readonly submittedEmail?: string
  readonly onReset: () => void
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading,
  submittedEmail,
  onReset,
}: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })
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
                Khôi phục tài khoản
              </p>
              <h1 className="text-foreground text-2xl leading-[1.2] font-semibold tracking-tight">
                Quên mật khẩu
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu.
              </p>
            </header>

            {submittedEmail ? (
              <div className="space-y-5">
                <Alert className="border-primary-container bg-card">
                  <MailCheck className="text-primary mt-0.5 size-4" aria-hidden="true" />
                  <AlertTitle>Kiểm tra email của bạn</AlertTitle>
                  <AlertDescription>
                    Nếu {submittedEmail} tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại
                    mật khẩu.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-3">
                  <Button asChild size="auth" className="w-full">
                    <Link href={APP_ROUTES.auth.login}>Quay lại đăng nhập</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="auth"
                    onClick={onReset}
                    className="w-full"
                  >
                    Gửi lại với email khác
                  </Button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Field data-invalid={Boolean(errors.email)}>
                  <FieldLabel
                    htmlFor="email"
                    className="text-foreground text-[11px] font-semibold tracking-[0.07em] uppercase"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                    className="bg-card h-10 rounded-md px-3 text-sm transition-shadow"
                    {...register('email')}
                  />
                  <FieldDescription>
                    Chúng tôi sẽ gửi hướng dẫn nếu email khớp với tài khoản đang hoạt động.
                  </FieldDescription>
                  <FieldError>{errors.email?.message}</FieldError>
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
                    <>
                      <Send className="size-4" aria-hidden="true" />
                      Gửi hướng dẫn
                    </>
                  )}
                </Button>

                <p className="text-muted-foreground text-center text-sm">
                  Đã nhớ mật khẩu?{' '}
                  <Link
                    href={APP_ROUTES.auth.login}
                    className="text-primary font-semibold underline-offset-4 hover:underline"
                  >
                    Quay lại đăng nhập
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
