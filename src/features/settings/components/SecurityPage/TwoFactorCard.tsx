'use client'

import { useEffect } from 'react'
import { Shield, ShieldQuestion } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { DisableTwoFactorDialog } from './DisableTwoFactorDialog'
import { EnableTwoFactorDialog } from './EnableTwoFactorDialog'
import { SectionIconBadge } from './SectionIconBadge'

export function TwoFactorCard() {
  const meQuery = useMeQuery()
  const isTwoFactorEnabled = meQuery.data?.isTwoFactorEnabled ?? false

  useEffect(() => {
    if (!meQuery.error) return
    console.error(meQuery.error)
    toast.error(meQuery.error.message ?? 'Không thể tải thông tin tài khoản. Vui lòng thử lại.')
  }, [meQuery.error])

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
      <CardContent className="px-6 py-6">
        {meQuery.isLoading && <Skeleton className="h-9 w-full" />}

        {meQuery.isError && !meQuery.isLoading && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <ShieldQuestion className="size-4" aria-hidden="true" />
            Không thể tải trạng thái xác thực hai yếu tố.
          </div>
        )}

        {meQuery.data && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'size-[9px] shrink-0 rounded-full',
                  isTwoFactorEnabled ? 'bg-primary' : 'bg-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[13px] font-semibold',
                  isTwoFactorEnabled ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isTwoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
              </span>
            </div>
            {isTwoFactorEnabled ? <DisableTwoFactorDialog /> : <EnableTwoFactorDialog />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
