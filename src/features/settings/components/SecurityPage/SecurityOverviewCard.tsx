import { Lock, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionIconBadge } from './SectionIconBadge'

interface SecurityOverviewCardProps {
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isTwoFactorEnabled: boolean
}

export function SecurityOverviewCard({
  isLoading,
  isError,
  isTwoFactorEnabled,
}: SecurityOverviewCardProps) {
  const twoFactorStatus = isTwoFactorEnabled ? 'Đã bật' : 'Chưa bật'

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="font-bold">Tổng quan bảo mật</CardTitle>
        <CardDescription>
          Kiểm tra nhanh các lớp bảo vệ đang áp dụng cho tài khoản của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid p-0 sm:grid-cols-2">
        <div className="flex items-center gap-3 border-b px-5 py-4 sm:border-r sm:border-b-0">
          <SectionIconBadge icon={Lock} tone="primary" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-semibold">Mật khẩu đăng nhập</p>
            <p className="text-muted-foreground">Có thể thay đổi bất kỳ lúc nào</p>
          </div>
          <Badge variant="outline">Đã thiết lập</Badge>
        </div>

        <div className="flex items-center gap-3 px-5 py-4">
          <SectionIconBadge
            icon={isError ? ShieldQuestion : ShieldCheck}
            tone={isTwoFactorEnabled ? 'primary' : 'neutral'}
          />
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-semibold">Xác thực hai yếu tố</p>
            <p className="text-muted-foreground">Mã OTP bổ sung khi đăng nhập</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <Badge variant={isError ? 'destructive' : isTwoFactorEnabled ? 'default' : 'outline'}>
              {isError ? 'Không khả dụng' : twoFactorStatus}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
