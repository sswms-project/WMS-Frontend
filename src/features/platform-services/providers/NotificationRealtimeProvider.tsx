'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getStoredAccessToken } from '@/lib/axios'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/stores/auth.store'
import { notificationCreatedEventSchema } from '../schemas/platform-services.schema'
import { createNotificationHubConnection } from '../services/notification-realtime.service'

interface NotificationRealtimeProviderProps {
  readonly children: ReactNode
}

const MAX_MANUAL_RESTARTS = 3

export function NotificationRealtimeProvider({ children }: NotificationRealtimeProviderProps) {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const shownEventsRef = useRef(new Set<string>())

  useEffect(() => {
    if (!user) return
    let disposed = false
    let restartAttempts = 0
    let restartTimer: ReturnType<typeof setTimeout> | undefined
    const connection = createNotificationHubConnection(() => getStoredAccessToken() ?? '')

    const invalidateNotifications = () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })

    connection.on('NotificationCreated', (payload: unknown) => {
      const result = notificationCreatedEventSchema.safeParse(payload)
      if (!result.success) {
        logger.warn('[notifications] Invalid realtime payload', result.error.flatten())
        return
      }
      void invalidateNotifications()
      if (!shownEventsRef.current.has(result.data.notificationId)) {
        shownEventsRef.current.add(result.data.notificationId)
        if (shownEventsRef.current.size > 100) shownEventsRef.current.clear()
        toast.info('Bạn có thông báo mới.')
      }
    })

    connection.onreconnected(() => {
      restartAttempts = 0
      void invalidateNotifications()
    })

    const start = async () => {
      if (disposed || !getStoredAccessToken()) return
      try {
        await connection.start()
        restartAttempts = 0
        await invalidateNotifications()
      } catch (error) {
        logger.warn('[notifications] Realtime connection unavailable', error)
        if (!disposed && restartAttempts < MAX_MANUAL_RESTARTS) {
          restartAttempts += 1
          restartTimer = setTimeout(() => void start(), restartAttempts * 3_000)
        }
      }
    }

    connection.onclose(() => {
      if (!disposed && restartAttempts < MAX_MANUAL_RESTARTS) {
        restartAttempts += 1
        restartTimer = setTimeout(() => void start(), restartAttempts * 3_000)
      }
    })

    void start()
    return () => {
      disposed = true
      if (restartTimer) clearTimeout(restartTimer)
      connection.off('NotificationCreated')
      void connection.stop()
    }
  }, [queryClient, user])

  return children
}
