import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type { StaffQuery, StaffResponse } from '../types/staff.types'

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

  deactivateStaff: (userId: string) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.staff.deactivate(userId))
      .then((response) => response.data),

  reactivateStaff: (userId: string) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.staff.reactivate(userId))
      .then((response) => response.data),
}
