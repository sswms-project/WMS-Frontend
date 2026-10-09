'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStockIssueRequestsQuery } from '../../hooks/use-stock-issue-requests'
import type { StockIssueRequestStatus } from '../../types/stock-issue.types'

const PICKING_STATUSES: readonly StockIssueRequestStatus[] = [
  'Pending',
  'ReleasedForPicking',
  'Picking',
]

const STATUS_LABEL: Partial<Record<StockIssueRequestStatus, string>> = {
  Pending: 'Chờ lấy hàng',
  ReleasedForPicking: 'Chờ lấy hàng',
  Picking: 'Đang lấy hàng',
}

interface StockIssuePickingQueueProps {
  readonly enabled: boolean
}

/** Phiếu xuất được giao cho nhân viên kho hiện tại, cần lấy hàng. */
export function StockIssuePickingQueue({ enabled }: StockIssuePickingQueueProps) {
  const reduceMotion = useReducedMotion()
  const query = useStockIssueRequestsQuery(
    { pageNumber: 1, pageSize: 20, assignedToMe: true },
    enabled
  )
  if (!enabled) return null

  const orders = (query.data?.items ?? []).filter((order) =>
    PICKING_STATUSES.includes(order.status)
  )

  return (
    <section aria-labelledby="stock-issue-picking-queue-title" className="mb-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="stock-issue-picking-queue-title" className="text-base font-semibold">
          Phiếu xuất cần lấy hàng
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/stock-issue-requests">Xem tất cả phiếu</Link>
        </Button>
      </div>
      {query.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <PackageSearch aria-hidden="true" className="size-4" />
          Chưa có phiếu xuất nào được giao cho bạn.
        </p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {orders.map((order, index) => (
            <motion.li
              key={order.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 6) * 0.04 }}
            >
              <Link
                href={`/stock-issue-requests?id=${order.id}`}
                className="bg-card hover:bg-accent flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.stockIssueRequestCode}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {order.recipientName} · {order.warehouseName} · {order.items.length} dòng hàng
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABEL[order.status] ?? order.status}</Badge>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  )
}
