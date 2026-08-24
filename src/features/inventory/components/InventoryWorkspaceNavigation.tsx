import Link from 'next/link'
import { Boxes, History } from 'lucide-react'
import { APP_ROUTES } from '@/routes/app-routes'
import { cn } from '@/lib/utils'

type InventoryWorkspaceView = 'availability' | 'movements'

interface InventoryWorkspaceNavigationProps {
  readonly currentView: InventoryWorkspaceView
}

export function InventoryWorkspaceNavigation({ currentView }: InventoryWorkspaceNavigationProps) {
  const linkClassName = (view: InventoryWorkspaceView) =>
    cn(
      'flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-medium transition-colors',
      view === currentView
        ? 'border-primary text-primary'
        : 'text-muted-foreground hover:border-border hover:text-foreground'
    )

  return (
    <nav
      className="flex shrink-0 overflow-x-auto border-b"
      aria-label="Không gian kiểm soát tồn kho"
    >
      <Link
        href={APP_ROUTES.inventory}
        aria-current={currentView === 'availability' ? 'page' : undefined}
        className={linkClassName('availability')}
      >
        <Boxes className="size-4" aria-hidden="true" />
        Tồn kho khả dụng
      </Link>
      <Link
        href={APP_ROUTES.inventoryMovements}
        aria-current={currentView === 'movements' ? 'page' : undefined}
        className={linkClassName('movements')}
      >
        <History className="size-4" aria-hidden="true" />
        Lịch sử biến động
      </Link>
    </nav>
  )
}
