import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationRealtimeProvider } from './NotificationRealtimeProvider'

const realtimeTest = vi.hoisted(() => {
  const eventHandlers = new Map<string, (payload: unknown) => void>()
  const accessTokenFactories: Array<() => string | Promise<string>> = []
  const reconnectedCallbacks: Array<() => void> = []
  const start = vi.fn().mockResolvedValue(undefined)
  const stop = vi.fn().mockResolvedValue(undefined)
  const off = vi.fn()
  const on = vi.fn((eventName: string, callback: (payload: unknown) => void) => {
    eventHandlers.set(eventName, callback)
  })
  const onclose = vi.fn()
  const onreconnected = vi.fn((callback: () => void) => {
    reconnectedCallbacks.push(callback)
  })
  return {
    accessTokenFactories,
    eventHandlers,
    reconnectedCallbacks,
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
    loggerWarn: vi.fn(),
    start,
    stop,
    off,
    on,
    onclose,
    onreconnected,
    createConnection: vi.fn((accessTokenFactory: () => string | Promise<string>) => {
      accessTokenFactories.push(accessTokenFactory)
      return { on, off, onclose, onreconnected, start, stop }
    }),
    toastInfo: vi.fn(),
  }
})

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: realtimeTest.invalidateQueries }),
}))

vi.mock('@/lib/axios', () => ({
  getStoredAccessToken: () => 'qa-access-token',
}))

vi.mock('@/lib/logger', () => ({
  logger: { warn: realtimeTest.loggerWarn },
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'owner-id' } }),
}))

vi.mock('sonner', () => ({
  toast: { info: realtimeTest.toastInfo },
}))

vi.mock('../services/notification-realtime.service', () => ({
  createNotificationHubConnection: realtimeTest.createConnection,
}))

describe('NotificationRealtimeProvider', () => {
  beforeEach(() => {
    realtimeTest.eventHandlers.clear()
    realtimeTest.accessTokenFactories.length = 0
    realtimeTest.reconnectedCallbacks.length = 0
    vi.clearAllMocks()
  })

  it('refreshes notification queries and shows one popup for a new realtime event', async () => {
    const { unmount } = render(
      <NotificationRealtimeProvider>
        <div>Private application</div>
      </NotificationRealtimeProvider>
    )

    await waitFor(() => expect(realtimeTest.start).toHaveBeenCalledOnce())
    expect(await realtimeTest.accessTokenFactories[0]?.()).toBe('qa-access-token')
    const notificationCreated = realtimeTest.eventHandlers.get('NotificationCreated')
    expect(notificationCreated).toBeDefined()

    const event = {
      notificationId: '93ce9974-fe84-4372-92f1-e06a7a900001',
      type: 'DeliveryUpdate',
      createdAt: '2026-09-01T12:00:00.000Z',
    }
    notificationCreated?.(event)
    notificationCreated?.(event)

    await waitFor(() => expect(realtimeTest.invalidateQueries).toHaveBeenCalledTimes(3))
    expect(realtimeTest.toastInfo).toHaveBeenCalledOnce()
    expect(realtimeTest.toastInfo).toHaveBeenCalledWith('Bạn có thông báo mới.', {
      duration: 6_000,
    })

    realtimeTest.reconnectedCallbacks[0]?.()
    await waitFor(() => expect(realtimeTest.invalidateQueries).toHaveBeenCalledTimes(4))

    unmount()
    expect(realtimeTest.off).toHaveBeenCalledWith('NotificationCreated')
    expect(realtimeTest.stop).toHaveBeenCalledOnce()
  })

  it('waits for an in-flight negotiation before stopping during cleanup', async () => {
    let resolveStart!: () => void
    realtimeTest.start.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveStart = resolve
        })
    )

    const { unmount } = render(
      <NotificationRealtimeProvider>
        <div>Private application</div>
      </NotificationRealtimeProvider>
    )

    await waitFor(() => expect(realtimeTest.start).toHaveBeenCalledOnce())
    unmount()
    expect(realtimeTest.stop).not.toHaveBeenCalled()

    resolveStart()

    await waitFor(() => expect(realtimeTest.stop).toHaveBeenCalledOnce())
    expect(realtimeTest.loggerWarn).not.toHaveBeenCalled()
  })
})
