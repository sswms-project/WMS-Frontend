import Link from 'next/link'
import { PackageMinus, Route, Undo2 } from 'lucide-react'
import { APP_ROUTES } from '@/routes/app-routes'
import { cn } from '@/lib/utils'

type OutboundWorkspaceView = 'orders' | 'returns' | 'delivery'

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
      'flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-sm border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      view === currentView
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
    )

  return (
    <nav
      className="flex shrink-0 gap-1 overflow-x-auto border-b px-1 pb-1"
      aria-label="Không gian điều chuyển và xuất kho"
    >
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
      {permissions.includes('returns:view') ? (
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
