'use client'

import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Loader2, RotateCcw, ShieldCheck } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FieldError } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import type { ApiErrorResponse } from '@/types/api'
import {
  classifyConfirmError,
  useTwoFactorConfirmMutation,
  useTwoFactorSetupMutation,
} from '../../hooks/use-two-factor'
import { twoFactorOtpSchema, type TwoFactorOtpFormValues } from '../../schemas/two-factor.schema'

type EnableFlowStep = 'setupLoading' | 'setupError' | 'setupReady' | 'setupExpired'

export function EnableTwoFactorDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<EnableFlowStep>('setupLoading')
  const [secret, setSecret] = useState<string>()
  const [qrUri, setQrUri] = useState<string>()
  const [apiErrorKind, setApiErrorKind] = useState<'invalidOtp' | 'network' | 'unknown' | null>(
    null
  )
  const [copied, setCopied] = useState(false)
  const setupSessionIdRef = useRef(0)

  const setupMutation = useTwoFactorSetupMutation()
  const confirmMutation = useTwoFactorConfirmMutation()

  const form = useForm<TwoFactorOtpFormValues>({
    resolver: zodResolver(twoFactorOtpSchema),
    defaultValues: { otp: '' },
  })
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form

  const isBusy = setupMutation.isPending || confirmMutation.isPending

  function startSetupFlow() {
    const sessionId = ++setupSessionIdRef.current
    setStep('setupLoading')

    setupMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (sessionId !== setupSessionIdRef.current) return
        setSecret(response.data.secret)
        setQrUri(response.data.qrUri)
        setStep('setupReady')
      },
      onError: () => {
        if (sessionId !== setupSessionIdRef.current) return
        setStep('setupError')
      },
    })
  }

  // Không đụng setupSessionIdRef — chỉ reset state cục bộ. An toàn gọi từ bất kỳ
  // callback nào (kể cả những callback transitively reachable từ handleSubmit()),
  // vì không truy cập ref.
  function resetLocalState() {
    setStep('setupLoading')
    setSecret(undefined)
    setQrUri(undefined)
    setApiErrorKind(null)
    setCopied(false)
    form.reset({ otp: '' })
    setupMutation.reset()
    confirmMutation.reset()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isBusy) return

    setOpen(nextOpen)

    if (nextOpen) {
      setApiErrorKind(null)
      setCopied(false)
      form.reset({ otp: '' })

      if (step === 'setupReady' && secret && qrUri) {
        setStep('setupReady')
        return
      }

      startSetupFlow()
    } else {
      setupSessionIdRef.current += 1
      setApiErrorKind(null)
      setCopied(false)
      form.reset({ otp: '' })
      setupMutation.reset()
      confirmMutation.reset()
    }
  }

  async function handleCopySecret() {
    if (!secret) return
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    toast.success('Đã sao chép')
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleConfirm(values: TwoFactorOtpFormValues) {
    setApiErrorKind(null)

    confirmMutation.mutate(
      { otp: values.otp },
      {
        onSuccess: () => {
          toast.success('Đã bật xác thực hai yếu tố.')
          setOpen(false)
          resetLocalState()
        },
        onError: (error: ApiErrorResponse) => {
          const kind = classifyConfirmError(error)

          if (kind === 'setupExpired') {
            setStep('setupExpired')
            return
          }

          if (kind === 'invalidOtp') {
            form.setValue('otp', '')
          }

          setApiErrorKind(kind)
        },
      }
    )
  }

  function handleOtpChange(value: string, onChange: (value: string) => void) {
    if (apiErrorKind) setApiErrorKind(null)
    onChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 gap-2 rounded-lg px-4.5 text-[13px] font-semibold">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Bật xác thực hai yếu tố
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[calc(100vw-2rem)] sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (isBusy) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isBusy) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (isBusy) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Bật xác thực hai yếu tố</DialogTitle>
          <DialogDescription>
            Quét mã QR bằng Google Authenticator hoặc Microsoft Authenticator, sau đó nhập mã OTP 6
            số để xác nhận.
          </DialogDescription>
        </DialogHeader>

        {step === 'setupLoading' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Loader2 className="text-primary size-6 animate-spin" aria-hidden="true" />
            <p className="text-muted-foreground text-sm">Đang tạo mã QR...</p>
          </div>
        )}

        {step === 'setupError' && (
          <div className="space-y-4 py-2">
            <Alert variant="destructive">
              <AlertTitle>Không thể tạo mã QR</AlertTitle>
              <AlertDescription>
                Đã xảy ra lỗi khi thiết lập 2FA. Vui lòng thử lại.
              </AlertDescription>
            </Alert>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={setupMutation.isPending}
              onClick={startSetupFlow}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Thử lại
            </Button>
          </div>
        )}

        {step === 'setupExpired' && (
          <div className="space-y-4 py-2">
            <Alert variant="destructive">
              <AlertTitle>Phiên thiết lập đã hết hạn</AlertTitle>
              <AlertDescription>
                Mã QR chỉ có hiệu lực trong 10 phút. Vui lòng lấy mã QR mới để tiếp tục.
              </AlertDescription>
            </Alert>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={setupMutation.isPending}
              onClick={startSetupFlow}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Lấy mã QR mới
            </Button>
          </div>
        )}

        {step === 'setupReady' && secret && qrUri && (
          <form onSubmit={handleSubmit(handleConfirm)} className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <div className="border-border bg-card max-w-full rounded-md border p-3">
                <QRCodeSVG value={qrUri} size={168} />
              </div>
              <div className="border-border bg-card flex w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2">
                <code className="text-foreground truncate font-mono text-xs">{secret}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopySecret}
                  aria-label="Sao chép mã bí mật"
                >
                  {copied ? (
                    <Check className="text-primary size-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-center text-xs">
                Không quét được QR? Nhập mã bí mật ở trên vào ứng dụng xác thực.
              </p>
            </div>

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
                <FieldError>Mã OTP không đúng. Vui lòng kiểm tra lại ứng dụng xác thực.</FieldError>
              )}
              {!errors.otp && apiErrorKind === 'network' && (
                <FieldError>Lỗi mạng hoặc máy chủ. Vui lòng thử lại.</FieldError>
              )}
              {!errors.otp && apiErrorKind === 'unknown' && (
                <FieldError>Đã xảy ra lỗi. Vui lòng thử lại.</FieldError>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                'Xác nhận'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
