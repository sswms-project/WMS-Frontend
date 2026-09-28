'use client'

import { Shield, ShieldQuestion } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TwoFactorOtpFormValues } from '../../schemas/two-factor.schema'
import { DisableTwoFactorDialog } from './DisableTwoFactorDialog'
import { EnableTwoFactorDialog } from './EnableTwoFactorDialog'
import { SectionIconBadge } from './SectionIconBadge'

interface TwoFactorCardProps {
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isTwoFactorEnabled: boolean
  readonly disableForm: UseFormReturn<TwoFactorOtpFormValues>
  readonly isDisabling: boolean
  readonly onDisable: (values: TwoFactorOtpFormValues) => Promise<void>
}

export function TwoFactorCard({
  isLoading,
  isError,
  isTwoFactorEnabled,
  disableForm,
  isDisabling,
  onDisable,
}: TwoFactorCardProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2.5 border-b px-6 pt-5 pb-4">
        <SectionIconBadge icon={Shield} />
        <div>
          <CardTitle className="text-[14.5px] font-bold">Xác thực hai yếu tố (2FA)</CardTitle>
          <CardDescription className="text-[12.5px]">
            Tăng cường bảo mật bằng mã OTP từ ứng dụng xác thực khi đăng nhập
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 px-6 py-6">
        {isLoading && <Skeleton className="h-9 w-full" />}

        {isError && !isLoading && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <ShieldQuestion className="size-4" aria-hidden="true" />
            Không thể tải trạng thái xác thực hai yếu tố.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-5">
            <div className="bg-surface-container-low border-border flex items-center gap-3 border px-4 py-3">
              <span
                className={cn(
                  'size-[9px] shrink-0 rounded-full',
                  isTwoFactorEnabled ? 'bg-primary' : 'bg-muted-foreground'
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-semibold',
                    isTwoFactorEnabled ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {isTwoFactorEnabled ? 'Đang được bảo vệ' : 'Chưa được bảo vệ bằng OTP'}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {isTwoFactorEnabled
                    ? 'Bạn sẽ nhập thêm mã xác thực sau mật khẩu.'
                    : 'Bật 2FA để giảm rủi ro khi mật khẩu bị lộ.'}
                </p>
              </div>
            </div>
            <div className="[&_[data-slot=dialog-trigger]]:w-full">
              {isTwoFactorEnabled ? (
                <DisableTwoFactorDialog
                  form={disableForm}
                  isPending={isDisabling}
                  onSubmit={onDisable}
                />
              ) : (
                <EnableTwoFactorDialog />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
