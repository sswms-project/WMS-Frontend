'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  UserRoundPlus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { BenefitsPanel } from '@/features/auth/components/RegisterPage'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  acceptInvitationSchema,
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { fullName: '', password: '', confirmPassword: '' },
  })

  return (
    <div className="flex min-h-dvh min-w-0">
      <aside className="sticky top-0 hidden h-dvh shrink-0 lg:block lg:w-[42%] xl:w-[45%]">
        <BenefitsPanel logoHref={APP_ROUTES.home} />
      </aside>

      <motion.main
        className="bg-background flex min-w-0 flex-1 flex-col"
        initial={{ opacity: 0 }}
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
          <div className="animate-in fade-in slide-in-from-bottom-3 w-full max-w-md duration-500">
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
                    aria-invalid={Boolean(errors.fullName)}
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
                      className="pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
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
                  <FieldDescription>Sử dụng ít nhất 8 ký tự.</FieldDescription>
                  <FieldError>{errors.password?.message}</FieldError>
                </Field>

                <Field data-invalid={Boolean(errors.confirmPassword)}>
                  <FieldLabel htmlFor="invitation-confirm-password">Xác nhận mật khẩu</FieldLabel>
                  <Input
                    id="invitation-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    {...register('confirmPassword')}
                  />
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </Field>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
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
