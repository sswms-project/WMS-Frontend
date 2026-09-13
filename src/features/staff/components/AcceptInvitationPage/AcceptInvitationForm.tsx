'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Circle, Eye, EyeOff, KeyRound, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS_VI } from '@/config/roles'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  acceptInvitationPasswordRequirements,
  createAcceptInvitationSchema,
  type AcceptInvitationFormValues,
} from '../../schemas/invitation.schema'
import type { InvitationPreviewResponse } from '../../types/invitation.types'

interface Props {
  readonly token?: string
  readonly preview?: InvitationPreviewResponse
  readonly isPreviewLoading: boolean
  readonly isLoading: boolean
  readonly isSuccess: boolean
  readonly errorMessage?: string
  readonly actionErrorMessage?: string
  readonly onSubmit: (values: AcceptInvitationFormValues) => Promise<void>
}

export function AcceptInvitationForm({
  token,
  preview,
  isPreviewLoading,
  isLoading,
  isSuccess,
  errorMessage,
  actionErrorMessage,
  onSubmit,
}: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const requiresFullName = Boolean(preview && !preview.fullName.trim())
  const formSchema = useMemo(
    () => createAcceptInvitationSchema(requiresFullName),
    [requiresFullName]
  )
  const form = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', password: '', confirmPassword: '' },
  })
  const password = useWatch({ control: form.control, name: 'password' }) ?? ''
  const unusable = !preview || preview.effectiveStatus !== 'Pending'

  return (
    <main className="bg-muted/30 flex min-h-dvh items-center justify-center p-4 sm:p-8">
      <section className="bg-background w-full max-w-2xl border">
        <header className="flex items-center justify-between border-b px-5 py-4 sm:px-7">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link href={APP_ROUTES.auth.login}>Đăng nhập</Link>
          </Button>
        </header>
        <div className="space-y-6 p-5 sm:p-7">
          <div>
            <p className="text-primary text-xs font-medium">Lời mời tham gia KOVIA</p>
            <h1 className="mt-1 text-2xl font-semibold">Kích hoạt quyền truy cập tổ chức</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Kiểm tra thông tin do quản trị viên cung cấp trước khi tiếp tục.
            </p>
          </div>

          {!token ? (
            <InvitationError message="Link thiếu mã xác thực. Hãy liên hệ người đã mời bạn." />
          ) : isPreviewLoading ? (
            <div className="space-y-3" aria-label="Đang kiểm tra lời mời">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : errorMessage || unusable ? (
            <InvitationError
              message={errorMessage ?? 'Lời mời đã hết hiệu lực hoặc đã được sử dụng.'}
            />
          ) : isSuccess ? (
            <SuccessState />
          ) : (
            preview && (
              <>
                <InvitationDetails preview={preview} />
                {actionErrorMessage && (
                  <Alert variant="destructive" role="alert">
                    <AlertTitle>Chưa thể hoàn tất thao tác</AlertTitle>
                    <AlertDescription>{actionErrorMessage}</AlertDescription>
                  </Alert>
                )}
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                  {requiresFullName && (
                    <Field data-invalid={Boolean(form.formState.errors.fullName)}>
                      <FieldLabel htmlFor="invitation-full-name">Họ và tên</FieldLabel>
                      <Input
                        id="invitation-full-name"
                        autoComplete="name"
                        maxLength={300}
                        disabled={isLoading}
                        aria-invalid={Boolean(form.formState.errors.fullName)}
                        placeholder="Nguyễn Văn A"
                        {...form.register('fullName')}
                      />
                      <FieldError>{form.formState.errors.fullName?.message}</FieldError>
                    </Field>
                  )}
                  <PasswordField
                    id="invitation-password"
                    label="Mật khẩu"
                    shown={showPassword}
                    disabled={isLoading}
                    error={form.formState.errors.password?.message}
                    registration={form.register('password')}
                    onToggle={() => setShowPassword((value) => !value)}
                  />
                  <ul className="text-muted-foreground grid gap-1 border p-3 text-xs sm:grid-cols-2">
                    {acceptInvitationPasswordRequirements.map((requirement) => {
                      const met = requirement.validate(password)
                      const Icon = met ? CheckCircle2 : Circle
                      return (
                        <li
                          key={requirement.id}
                          className={cn('flex items-center gap-2', met && 'text-primary')}
                        >
                          <Icon className="size-3.5" aria-hidden="true" />
                          {requirement.label}
                        </li>
                      )
                    })}
                  </ul>
                  <PasswordField
                    id="invitation-confirm-password"
                    label="Xác nhận mật khẩu"
                    shown={false}
                    disabled={isLoading}
                    error={form.formState.errors.confirmPassword?.message}
                    registration={form.register('confirmPassword')}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <LoaderCircle
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    )}
                    Kích hoạt tài khoản
                  </Button>
                </form>
              </>
            )
          )}
        </div>
      </section>
    </main>
  )
}

function InvitationDetails({ preview }: { readonly preview: InvitationPreviewResponse }) {
  return (
    <div className="bg-card grid gap-3 border p-4 sm:grid-cols-2">
      {preview.fullName.trim() && <ReadOnlyField label="Họ và tên" value={preview.fullName} />}
      <ReadOnlyField label="Email" value={preview.email} />
      <ReadOnlyField label="Tổ chức" value={preview.tenantName} />
      <ReadOnlyField label="Vai trò" value={ROLE_LABELS_VI[preview.role]} />
      <div className="sm:col-span-2">
        <p className="text-muted-foreground text-xs">Kho ban đầu</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {preview.warehouses.map((warehouse) => (
            <Badge key={warehouse.id} variant="outline">
              {warehouse.warehouseCode} · {warehouse.warehouseName}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function InvitationError({ message }: { readonly message: string }) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <KeyRound aria-hidden="true" />
        <AlertTitle>Không thể sử dụng lời mời</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button asChild variant="outline" className="w-full">
        <Link href={APP_ROUTES.auth.login}>Về trang đăng nhập</Link>
      </Button>
    </div>
  )
}

function SuccessState() {
  return (
    <div className="space-y-4">
      <Alert className="border-primary/40 bg-primary/5">
        <CheckCircle2 className="text-primary" aria-hidden="true" />
        <AlertTitle>Kích hoạt thành công</AlertTitle>
        <AlertDescription>
          Tài khoản đã được kích hoạt. Hãy đăng nhập bằng email nhận lời mời để bắt đầu làm việc.
        </AlertDescription>
      </Alert>
      <Button asChild className="w-full">
        <Link href={APP_ROUTES.auth.login}>Đăng nhập</Link>
      </Button>
    </div>
  )
}

interface PasswordFieldProps {
  readonly id: string
  readonly label: string
  readonly shown: boolean
  readonly disabled: boolean
  readonly error?: string
  readonly registration: UseFormRegisterReturn
  readonly onToggle?: () => void
}

function PasswordField({
  id,
  label,
  shown,
  disabled,
  error,
  registration,
  onToggle,
}: PasswordFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete="new-password"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={onToggle ? 'pr-11' : undefined}
          {...registration}
        />
        {onToggle && (
          <button
            type="button"
            className="text-muted-foreground absolute top-1/2 right-0 flex size-10 -translate-y-1/2 items-center justify-center"
            aria-label={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={onToggle}
          >
            {shown ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
