'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { APP_ROUTES } from '@/routes/app-routes'
import { BenefitsPanel } from '@/features/auth/components/RegisterPage'

interface LoginFormProps {
  readonly onSubmit: (values: LoginFormValues) => Promise<void>
  readonly isLoading: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
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

  return (
    <div className="flex min-h-dvh min-w-0">
      {/* Left brand panel — sticky */}
      <aside className="sticky top-0 hidden h-dvh flex-shrink-0 lg:block lg:w-[42%] xl:w-[45%]">
        <BenefitsPanel logoHref={APP_ROUTES.home} />
      </aside>

      {/* Right form area */}
      <motion.div
        className="bg-background flex min-w-0 flex-1 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-12">
          <Logo className="lg:hidden" />
          <div className="hidden lg:block" aria-hidden="true" />
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground hidden text-xs md:inline">
              Hỗ trợ: 1800-KOVIA
            </span>
            <Link
              href={APP_ROUTES.auth.register}
              className="text-foreground border-border hover:bg-muted rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </header>

        {/* Centered form */}
        <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-12 xl:px-16">
          <div className="animate-in fade-in slide-in-from-bottom-3 w-full max-w-md duration-500">
            <header className="mb-8">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
                Hệ thống quản lý kho
              </p>
              <h1 className="text-foreground text-2xl leading-[1.2] font-semibold tracking-tight">
                Đăng nhập
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Nhập thông tin tài khoản để truy cập hệ thống.
              </p>
            </header>

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
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.password)}>
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="password"
                    className="text-foreground text-[11px] font-semibold tracking-[0.07em] uppercase"
                  >
                    Mật khẩu
                  </FieldLabel>
                  <Link
                    href={APP_ROUTES.auth.forgotPassword}
                    className="text-muted-foreground hover:text-primary text-xs transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    aria-invalid={Boolean(errors.password)}
                    autoComplete="current-password"
                    className="bg-card h-10 rounded-md pr-10 pl-3 text-sm transition-shadow"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
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

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-1 h-10 w-full cursor-pointer rounded-md text-sm font-semibold transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            <div className="border-border mt-8 border-t pt-6">
              <p className="text-muted-foreground text-center text-sm">
                Chưa có tài khoản?{' '}
                <Link
                  href={APP_ROUTES.auth.register}
                  className="text-primary font-semibold underline-offset-4 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
