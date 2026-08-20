import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import type { UpdateOrganizationRequest } from '../schemas/organization.schema'
import { organizationService } from '../services/organization.service'
import type { OrganizationResponse } from '../types/organization.types'

export function useOrganizationQuery() {
  return useQuery<OrganizationResponse, ApiErrorResponse>({
    queryKey: queryKeys.organization.me,
    queryFn: () => organizationService.getOrganization().then((response) => response.data),
  })
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<OrganizationResponse>,
    ApiErrorResponse,
    UpdateOrganizationRequest
  >({
    mutationFn: organizationService.updateOrganization,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.organization.me, response.data)
    },
    onError: (error) => logger.error(error),
  })
}
