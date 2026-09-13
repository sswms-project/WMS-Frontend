import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  AuditLogListResponse,
  AuditLogQuery,
  NotificationListResponse,
  NotificationQuery,
} from '../types/platform-services.types'

export const platformServicesService = {
  getNotifications: (params: NotificationQuery) =>
    axiosClient
      .get<ApiResponse<NotificationListResponse>>(API_ENDPOINTS.notifications.list, { params })
      .then((response) => response.data.data),
  markNotificationRead: (notificationId: string) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.notifications.markRead(notificationId))
      .then((response) => response.data.data),
  markAllNotificationsRead: () =>
    axiosClient
      .put<ApiResponse<number>>(API_ENDPOINTS.notifications.markAllRead)
      .then((response) => response.data.data),
  getAuditLogs: (params: AuditLogQuery) =>
    axiosClient
      .get<ApiResponse<AuditLogListResponse>>(API_ENDPOINTS.auditLogs.list, { params })
      .then((response) => response.data.data),
}
