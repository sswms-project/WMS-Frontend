'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, KeyRound, Loader2, ShieldQuestion } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { BenefitsPanel } from '@/features/auth/components/RegisterPage'
import type { Verify2FAErrorKind } from '@/features/auth/hooks/use-auth'
import {
  verifyTwoFactorSchema,
  type VerifyTwoFactorFormValues,
} from '@/features/auth/schemas/verify-two-factor.schema'

export type VerifyStep =
  | { status: 'form' }
  | { status: 'sessionExpired' }
  | { status: 'accountUnavailable'; reason: 'userNotFound' | 'inactive' }

interface VerifyTwoFactorFormProps {
  readonly tempTokenStatus: 'loading' | 'missing' | 'ready'
  readonly step: VerifyStep
  readonly onSubmit: (values: VerifyTwoFactorFormValues) => void
  readonly isLoading: boolean
  readonly apiErrorKind: Verify2FAErrorKind | null
  readonly onErrorClear: () => void
  readonly onBackToLogin: () => void
}

function BackToLoginButton({
  onBackToLogin,
  isLoading,
}: {
  readonly onBackToLogin: () => void
  readonly isLoading: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="auth"
      className="w-full"
      disabled={isLoading}
      onClick={onBackToLogin}
    >
      Quay lại đăng nhập
    </Button>
  )
}

export function VerifyTwoFactorForm({
  tempTokenStatus,
  step,
  onSubmit,
  isLoading,
  apiErrorKind,
  onErrorClear,
  onBackToLogin,
}: VerifyTwoFactorFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyTwoFactorFormValues>({
    resolver: zodResolver(verifyTwoFactorSchema),
    defaultValues: { otp: '' },
  })

  useEffect(() => {
    if (apiErrorKind === 'invalidOtp') setValue('otp', '')
  }, [apiErrorKind, setValue])

  function handleOtpChange(value: string, onChange: (value: string) => void) {
    if (apiErrorKind) onErrorClear()
    onChange(value)
  }

  return (
    <div className="flex min-h-dvh min-w-0">
      <aside className="sticky top-0 hidden h-dvh flex-shrink-0 lg:block lg:w-[42%] xl:w-[45%]">
        <BenefitsPanel />
      </aside>

      <div className="bg-background flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-12">
          <Logo className="lg:hidden" />
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Đăng nhập
          </button>
        </header>

        <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <header className="mb-8">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
                Xác thực hai yếu tố
              </p>
              <h1 className="text-foreground text-2xl leading-[1.2] font-semibold tracking-tight">
                Nhập mã xác thực
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Nhập mã OTP 6 số từ ứng dụng xác thực (Google/Microsoft Authenticator) để hoàn tất
                đăng nhập.
              </p>
            </header>

            {/* step.status khác 'form' luôn được ưu tiên hiển thị trước, không phụ thuộc lại
                tempTokenStatus — vì shouldClearTempTokenOnError xoá sessionStorage ngay khi
                sessionExpired/accountUnavailable xảy ra, khiến tempTokenStatus tự chuyển
                'missing' ở lần render kế tiếp. Nếu để tempTokenStatus === 'ready' làm điều
                kiện, state lỗi vừa set sẽ bị đè lại bởi nhánh 'missing' ngay sau đó. */}
            {step.status === 'form' && tempTokenStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="text-primary size-6 animate-spin" aria-hidden="true" />
              </div>
            )}

            {step.status === 'form' && tempTokenStatus === 'missing' && (
              <div className="space-y-5">
                <Alert variant="destructive">
                  <ShieldQuestion className="mt-0.5 size-4" aria-hidden="true" />
                  <AlertTitle>Phiên xác thực không tồn tại</AlertTitle>
                  <AlertDescription>
                    Vui lòng đăng nhập lại để tiếp tục xác thực hai yếu tố.
                  </AlertDescription>
                </Alert>
                <BackToLoginButton onBackToLogin={onBackToLogin} isLoading={isLoading} />
              </div>
            )}

            {step.status === 'sessionExpired' && (
              <div className="space-y-5">
                <Alert variant="destructive">
                  <KeyRound className="mt-0.5 size-4" aria-hidden="true" />
                  <AlertTitle>Phiên xác thực đã hết hạn</AlertTitle>
                  <AlertDescription>
                    Phiên xác thực đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại.
                  </AlertDescription>
                </Alert>
                <BackToLoginButton onBackToLogin={onBackToLogin} isLoading={isLoading} />
              </div>
            )}

            {step.status === 'accountUnavailable' && (
              <div className="space-y-5">
                <Alert variant="destructive">
                  <ShieldQuestion className="mt-0.5 size-4" aria-hidden="true" />
                  <AlertTitle>Không thể tiếp tục xác thực</AlertTitle>
                  <AlertDescription>
                    {step.reason === 'inactive'
                      ? 'Tài khoản hiện không hoạt động. Vui lòng liên hệ quản trị viên.'
                      : 'Không thể tiếp tục xác thực tài khoản này. Vui lòng đăng nhập lại.'}
                  </AlertDescription>
                </Alert>
                <BackToLoginButton onBackToLogin={onBackToLogin} isLoading={isLoading} />
              </div>
            )}

            {tempTokenStatus === 'ready' && step.status === 'form' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <Controller
                    control={control}
                    name="otp"
                    render={({ field }) => (
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={(value) => handleOtpChange(value, field.onChange)}
                      >
                        <InputOTPGroup
                          aria-invalid={Boolean(errors.otp) || apiErrorKind === 'invalidOtp'}
                        >
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />
                  {errors.otp && <FieldError>{errors.otp.message}</FieldError>}
                  {!errors.otp && apiErrorKind === 'invalidOtp' && (
                    <FieldError>Mã OTP không đúng.</FieldError>
                  )}
                  {!errors.otp && apiErrorKind === 'network' && (
                    <FieldError>Lỗi mạng hoặc máy chủ. Vui lòng thử lại.</FieldError>
                  )}
                  {!errors.otp && apiErrorKind === 'unknown' && (
                    <FieldError>Đã xảy ra lỗi. Vui lòng thử lại.</FieldError>
                  )}
                </div>

                <Button type="submit" size="auth" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    'Xác nhận'
                  )}
                </Button>

                <BackToLoginButton onBackToLogin={onBackToLogin} isLoading={isLoading} />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
