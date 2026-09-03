import { Info, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function AccessControlHeader() {
  return (
    <header className="border-border flex shrink-0 flex-col gap-3 border-b pb-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-foreground text-xl font-semibold text-balance">Phân quyền</h1>
          <p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-5 sm:text-sm">
            Quản lý quyền truy cập của các vai trò vận hành trong tổ chức hiện tại.
          </p>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            tabIndex={0}
            className="focus-visible:ring-ring/50 w-fit cursor-help gap-1.5 focus-visible:ring-[3px] focus-visible:outline-none"
          >
            Phạm vi tenant
            <Info aria-hidden="true" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-72">
          Chỉ Chủ doanh nghiệp được thay đổi quyền. Quyền hệ thống và quản trị nền tảng không được
          ủy quyền.
        </TooltipContent>
      </Tooltip>
    </header>
  )
}
