import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { platformServicesService } from './platform-services.service'

vi.mock('@/lib/axios', () => ({ axiosClient: { get: vi.fn(), put: vi.fn() } }))

const response = { data: { isSuccess: true, statusCode: 200, message: 'OK', data: { items: [] } } }

describe('platformServicesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axiosClient.get).mockResolvedValue(response)
    vi.mocked(axiosClient.put).mockResolvedValue(response)
  })

  it('sends exact notification and audit query parameters', async () => {
    const notificationQuery = { pageNumber: 1, pageSize: 20, isRead: false }
    const auditQuery = { pageNumber: 2, pageSize: 20, action: 'Approve' }
    await platformServicesService.getNotifications(notificationQuery)
    await platformServicesService.getAuditLogs(auditQuery)
    expect(axiosClient.get).toHaveBeenNthCalledWith(1, API_ENDPOINTS.notifications.list, {
      params: notificationQuery,
    })
    expect(axiosClient.get).toHaveBeenNthCalledWith(2, API_ENDPOINTS.auditLogs.list, {
      params: auditQuery,
    })
  })

  it('uses idempotent notification read endpoints', async () => {
    await platformServicesService.markNotificationRead('notification-1')
    await platformServicesService.markAllNotificationsRead()
    expect(axiosClient.put).toHaveBeenNthCalledWith(
      1,
      API_ENDPOINTS.notifications.markRead('notification-1')
    )
    expect(axiosClient.put).toHaveBeenNthCalledWith(2, API_ENDPOINTS.notifications.markAllRead)
  })
})
