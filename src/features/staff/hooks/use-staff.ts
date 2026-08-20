import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import { staffService } from '../services/staff.service'
import {
  STAFF_DIRECTORY_KINDS,
  type StaffDirectoryKind,
  type StaffQuery,
  type StaffResponse,
} from '../types/staff.types'

export function useStaffListQuery(kind: StaffDirectoryKind, params: StaffQuery) {
  return useQuery<QueryResult<StaffResponse>, ApiErrorResponse>({
    queryKey: queryKeys.staff.list(kind, params),
    queryFn: () => {
      const request =
        kind === STAFF_DIRECTORY_KINDS.managers
          ? staffService.getManagers(params)
          : staffService.getStaff(params)
      return request.then((response) => response.data)
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useStaffDetailsQuery(userId: string | null) {
  return useQuery<StaffResponse, ApiErrorResponse>({
    queryKey: queryKeys.staff.detail(userId ?? ''),
    queryFn: () => staffService.getStaffDetails(userId ?? '').then((response) => response.data),
    enabled: Boolean(userId),
  })
}

function useStaffLifecycleMutation(action: 'deactivate' | 'reactivate') {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn:
      action === 'deactivate' ? staffService.deactivateStaff : staffService.reactivateStaff,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(userId) })
    },
    onError: (error) => logger.error(error),
  })
}

export function useDeactivateStaffMutation() {
  return useStaffLifecycleMutation('deactivate')
}

export function useReactivateStaffMutation() {
  return useStaffLifecycleMutation('reactivate')
}
