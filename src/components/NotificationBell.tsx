'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppNotification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
}

interface NotificationBellProps {
  notifications: AppNotification[]
}

export function NotificationBell({ notifications: initialNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((notification) => !notification.read).length

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Thông báo">
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4">
              <span className="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-75" />
              <span className="bg-destructive text-destructive-foreground relative flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                {unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-sm">Không có thông báo</p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onSelect={() => markAsRead(notification.id)}
              className="flex flex-col items-start gap-1 py-2"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={
                    notification.read
                      ? 'text-muted-foreground text-sm'
                      : 'text-foreground text-sm font-semibold'
                  }
                >
                  {notification.title}
                </span>
                {!notification.read && (
                  <span className="bg-primary size-2 flex-shrink-0 rounded-full" />
                )}
              </div>
              <span className="text-muted-foreground text-xs">{notification.description}</span>
              <span className="text-muted-foreground text-[11px]">{notification.timestamp}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
