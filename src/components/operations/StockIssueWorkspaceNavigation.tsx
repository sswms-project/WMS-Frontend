import Link from 'next/link'
import type { Route } from 'next'
import { PackageMinus, Undo2 } from 'lucide-react'
import { P } from '@/config/permissionCodes'
import { APP_ROUTES } from '@/routes/app-routes'
import { cn } from '@/lib/utils'

type StockIssueWorkspaceView = 'stockIssueRequests' | 'goodsReturnRequests'

interface StockIssueWorkspaceNavigationProps {
  readonly currentView: StockIssueWorkspaceView
  readonly permissions: readonly string[]
}

export function StockIssueWorkspaceNavigation({
  currentView,
  permissions,
}: StockIssueWorkspaceNavigationProps) {
  const linkClassName = (view: StockIssueWorkspaceView) =>
    cn(
      'flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-sm border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      view === currentView
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
    )

  return (
    <nav
      className="flex shrink-0 gap-1 overflow-x-auto border-b px-1 pb-1"
      aria-label="Không gian xuất kho và trả hàng"
    >
      {permissions.includes(P.STOCK_ISSUE_REQUESTS_VIEW) ? (
        <Link
          href={APP_ROUTES.stockIssueRequests as Route}
          aria-current={currentView === 'stockIssueRequests' ? 'page' : undefined}
          className={linkClassName('stockIssueRequests')}
        >
          <PackageMinus className="size-4" aria-hidden="true" />
          Xuất kho
        </Link>
      ) : null}
      {permissions.includes(P.GOODS_RETURN_REQUESTS_VIEW) ? (
        <Link
          href={APP_ROUTES.goodsReturnRequests as Route}
          aria-current={currentView === 'goodsReturnRequests' ? 'page' : undefined}
          className={linkClassName('goodsReturnRequests')}
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Trả hàng
        </Link>
      ) : null}
    </nav>
  )
}
