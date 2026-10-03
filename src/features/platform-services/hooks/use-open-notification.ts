'use client'

import { useState } from 'react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import type { NotificationItem } from '../types/platform-services.types'
import { getNotificationReferenceRoute } from '../utils/platform-services-format'
import { useMarkNotificationReadMutation } from './use-platform-services'

export function useOpenNotification() {
  const router = useRouter()
  const markReadMutation = useMarkNotificationReadMutation()
  const [pendingNotificationId, setPendingNotificationId] = useState<string | null>(null)

  function markRead(notification: NotificationItem) {
    if (notification.isRead) return
    setPendingNotificationId(notification.id)
    markReadMutation.mutate(notification.id, {
      onSettled: () => setPendingNotificationId(null),
    })
  }

  function open(notification: NotificationItem) {
    markRead(notification)
    const route = getNotificationReferenceRoute(notification)
    if (route) router.push(route as Route)
  }

  return { pendingNotificationId, markRead, open }
}
