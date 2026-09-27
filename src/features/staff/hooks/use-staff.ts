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

export function useStaffListQuery(kind: StaffDirectoryKind, params: StaffQuery, enabled = true) {
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
    enabled,
  })
}

export function useStaffDetailsQuery(userId: string | null) {
  return useQuery<StaffResponse, ApiErrorResponse>({
    queryKey: queryKeys.staff.detail(userId ?? ''),
    queryFn: () => staffService.getStaffDetails(userId ?? '').then((response) => response.data),
    enabled: Boolean(userId),
  })
}

export function useTerminateStaffMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: staffService.terminateStaff,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(userId) })
    },
    onError: (error) => logger.error(error),
  })
}

export function useChangeStaffAccountStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, { userId: string; activate: boolean }>(
    {
      mutationFn: ({ userId, activate }) =>
        activate ? staffService.activateStaff(userId) : staffService.deactivateStaff(userId),
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(userId) })
      },
      onError: (error) => logger.error(error),
    }
  )
}
