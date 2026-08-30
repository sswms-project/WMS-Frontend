import Link from 'next/link'
import { ArrowLeftRight, PackageMinus, Route, Undo2 } from 'lucide-react'
import { APP_ROUTES } from '@/routes/app-routes'
import { cn } from '@/lib/utils'

type OutboundWorkspaceView = 'transfers' | 'orders' | 'returns' | 'delivery'

interface OutboundWorkspaceNavigationProps {
  readonly currentView: OutboundWorkspaceView
  readonly permissions: readonly string[]
}

export function OutboundWorkspaceNavigation({
  currentView,
  permissions,
}: OutboundWorkspaceNavigationProps) {
  const linkClassName = (view: OutboundWorkspaceView) =>
    cn(
      'flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-medium transition-colors',
      view === currentView
        ? 'border-primary text-primary'
        : 'text-muted-foreground hover:border-border hover:text-foreground'
    )

  return (
    <nav
      className="flex shrink-0 overflow-x-auto border-b"
      aria-label="Không gian điều chuyển và xuất kho"
    >
      {permissions.includes('transfers:view') ? (
        <Link
          href={APP_ROUTES.transfers}
          aria-current={currentView === 'transfers' ? 'page' : undefined}
          className={linkClassName('transfers')}
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Điều chuyển
        </Link>
      ) : null}
      {permissions.includes('outbound-orders:view') ? (
        <Link
          href={APP_ROUTES.orders}
          aria-current={currentView === 'orders' ? 'page' : undefined}
          className={linkClassName('orders')}
        >
          <PackageMinus className="size-4" aria-hidden="true" />
          Xuất kho
        </Link>
      ) : null}
      {permissions.includes('returns:approve') ? (
        <Link
          href={APP_ROUTES.returns}
          aria-current={currentView === 'returns' ? 'page' : undefined}
          className={linkClassName('returns')}
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Trả hàng
        </Link>
      ) : null}
      {permissions.includes('deliveries:view') ? (
        <Link
          href={APP_ROUTES.delivery}
          aria-current={currentView === 'delivery' ? 'page' : undefined}
          className={linkClassName('delivery')}
        >
          <Route className="size-4" aria-hidden="true" />
          Giao hàng
        </Link>
      ) : null}
    </nav>
  )
}
