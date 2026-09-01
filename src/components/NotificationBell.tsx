'use client'

import Link from 'next/link'
import { Bell, CheckCheck, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { NotificationItem } from '@/features/platform-services/types/platform-services.types'
import { formatPlatformDateTime } from '@/features/platform-services/utils/platform-services-format'
import { APP_ROUTES } from '@/routes/app-routes'

interface NotificationBellProps {
  readonly notifications: NotificationItem[]
  readonly unreadCount: number
  readonly isLoading: boolean
  readonly isError: boolean
  readonly pendingNotificationId: string | null
  readonly isMarkingAll: boolean
  readonly onMarkRead: (notification: NotificationItem) => void
  readonly onMarkAllRead: () => void
  readonly onRetry: () => void
}

export function NotificationBell(props: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Thông báo${props.unreadCount > 0 ? `, ${props.unreadCount} chưa đọc` : ''}`}
        >
          <Bell className="size-5" aria-hidden="true" />
          {props.unreadCount > 0 ? (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
              {props.unreadCount > 99 ? '99+' : props.unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-1rem))]">
        <div className="flex items-center justify-between gap-2 px-2">
          <DropdownMenuLabel className="px-0">Thông báo</DropdownMenuLabel>
          {props.unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={props.isMarkingAll}
              onClick={props.onMarkAllRead}
            >
              <CheckCheck data-icon="inline-start" aria-hidden="true" />
              Đọc tất cả
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {props.isLoading ? (
          <p role="status" className="text-muted-foreground px-2 py-4 text-center text-sm">
            Đang tải thông báo…
          </p>
        ) : null}
        {props.isError ? (
          <div role="alert" className="flex flex-col items-center gap-2 px-2 py-4 text-sm">
            <p>Không thể tải thông báo.</p>
            <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
              <RefreshCw data-icon="inline-start" aria-hidden="true" />
              Thử lại
            </Button>
          </div>
        ) : null}
        {!props.isLoading && !props.isError && props.notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-sm">Không có thông báo</p>
        ) : null}
        {!props.isLoading && !props.isError
          ? props.notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                disabled={props.pendingNotificationId === notification.id}
                onSelect={() => props.onMarkRead(notification)}
                className="flex flex-col items-start gap-1 py-2"
              >
                <div className="flex w-full items-center gap-2">
                  <span
                    className={
                      notification.isRead
                        ? 'text-muted-foreground min-w-0 flex-1 truncate text-sm'
                        : 'text-foreground min-w-0 flex-1 truncate text-sm font-semibold'
                    }
                  >
                    {notification.title}
                  </span>
                  <span
                    className={
                      notification.isRead
                        ? 'bg-muted-foreground/30 size-2 shrink-0 rounded-full'
                        : 'bg-primary size-2 shrink-0 rounded-full'
                    }
                    aria-label={notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                  />
                </div>
                <span className="text-muted-foreground line-clamp-2 text-xs">
                  {notification.message}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {formatPlatformDateTime(notification.createdAt)}
                </span>
              </DropdownMenuItem>
            ))
          : null}
        <DropdownMenuSeparator />
        <Button asChild variant="ghost" className="w-full">
          <Link href={APP_ROUTES.notifications}>Xem tất cả thông báo</Link>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
