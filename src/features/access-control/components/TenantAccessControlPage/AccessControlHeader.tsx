import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AccessControlHeader() {
  return (
    <header className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-foreground text-xl font-semibold">Phân quyền</h1>
          <p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-5 sm:text-sm">
            Quản lý quyền truy cập của các vai trò vận hành trong tổ chức hiện tại.
          </p>
        </div>
      </div>
      <Badge variant="outline" className="w-fit">
        Phạm vi tenant
      </Badge>
    </header>
  )
}
