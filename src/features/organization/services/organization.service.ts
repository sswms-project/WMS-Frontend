import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type { UpdateOrganizationRequest } from '../schemas/organization.schema'
import type { OrganizationResponse } from '../types/organization.types'

export const organizationService = {
  getOrganization: () =>
    axiosClient
      .get<ApiResponse<OrganizationResponse>>(API_ENDPOINTS.organization.me)
      .then((response) => response.data),

  updateOrganization: (body: UpdateOrganizationRequest) =>
    axiosClient
      .put<ApiResponse<OrganizationResponse>>(API_ENDPOINTS.organization.me, body)
      .then((response) => response.data),
}
