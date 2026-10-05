import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type {
  FormerStaffResponse,
  StaffEmploymentHistory,
  StaffQuery,
  StaffResponse,
  UpdateStaffEmploymentPeriodVariables,
} from '../types/staff.types'

export const staffService = {
  getManagers: (params: StaffQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<StaffResponse>>>(API_ENDPOINTS.staff.managers, { params })
      .then((response) => response.data),

  getStaff: (params: StaffQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<StaffResponse>>>(API_ENDPOINTS.staff.list, { params })
      .then((response) => response.data),

  getStaffDetails: (userId: string) =>
    axiosClient
      .get<ApiResponse<StaffResponse>>(API_ENDPOINTS.staff.detail(userId))
      .then((response) => response.data),

  getFormerStaff: (params: StaffQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<FormerStaffResponse>>>(API_ENDPOINTS.staff.former, { params })
      .then((response) => response.data),

  getEmploymentHistory: (userId: string) =>
    axiosClient
      .get<ApiResponse<StaffEmploymentHistory>>(API_ENDPOINTS.staff.employmentHistory(userId))
      .then((response) => response.data),

  updateEmploymentPeriod: ({ userId, periodId, request }: UpdateStaffEmploymentPeriodVariables) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.staff.employmentPeriod(userId, periodId), request)
      .then((response) => response.data),

  terminateStaff: (userId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.staff.terminate(userId))
      .then((response) => response.data),

  activateStaff: (userId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.staff.activate(userId))
      .then((response) => response.data),

  deactivateStaff: (userId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.staff.deactivate(userId))
      .then((response) => response.data),
}
