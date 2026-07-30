'use client'

import { Lock, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { SectionIconBadge } from './SectionIconBadge'

export function SecurityOverviewCard() {
  const meQuery = useMeQuery()
  const isTwoFactorEnabled = meQuery.data?.isTwoFactorEnabled ?? false

  return (
    <Card className="gap-0 py-0 lg:sticky lg:top-20">
      <CardHeader className="border-b px-4.5 py-4">
        <p className="text-foreground text-[13px] font-bold">Tổng quan bảo mật</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4.5 py-4">
        <div className="flex items-start gap-2.5">
          <SectionIconBadge icon={Lock} />
          <div>
            <p className="text-foreground text-[12.5px] font-semibold">Mật khẩu</p>
            <p className="text-muted-foreground mt-0.5 text-xs">Dùng để đăng nhập vào tài khoản</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <SectionIconBadge icon={Shield} tone={isTwoFactorEnabled ? 'primary' : 'neutral'} />
          <div>
            <p className="text-foreground text-[12.5px] font-semibold">Xác thực 2 yếu tố</p>
            {meQuery.isLoading ? (
              <Skeleton className="mt-1 h-3 w-14" />
            ) : (
              <p
                className={cn(
                  'mt-0.5 text-xs font-semibold',
                  isTwoFactorEnabled ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isTwoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
              </p>
            )}
          </div>
        </div>

        <div className="bg-border h-px" />

        <p className="text-muted-foreground text-[11.5px] leading-relaxed">
          Mẹo: bật xác thực hai yếu tố và đổi mật khẩu định kỳ để bảo vệ tài khoản khỏi truy cập
          trái phép.
        </p>
      </CardContent>
    </Card>
  )
}
