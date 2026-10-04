import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import { staffService } from '../services/staff.service'
import {
  STAFF_DIRECTORY_KINDS,
  type FormerStaffResponse,
  type StaffDirectoryKind,
  type StaffEmploymentHistory,
  type StaffQuery,
  type StaffResponse,
  type UpdateStaffEmploymentPeriodVariables,
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

export function useFormerStaffQuery(params: StaffQuery, enabled: boolean) {
  return useQuery<QueryResult<FormerStaffResponse>, ApiErrorResponse>({
    queryKey: queryKeys.staff.former(params),
    queryFn: () => staffService.getFormerStaff(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useStaffEmploymentHistoryQuery(userId: string, enabled: boolean) {
  return useQuery<StaffEmploymentHistory, ApiErrorResponse>({
    queryKey: queryKeys.staff.employmentHistory(userId),
    queryFn: () => staffService.getEmploymentHistory(userId).then((response) => response.data),
    enabled: enabled && Boolean(userId),
  })
}

export function useUpdateStaffEmploymentPeriodMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateStaffEmploymentPeriodVariables>({
    mutationFn: staffService.updateEmploymentPeriod,
    onSuccess: (_, { userId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.employmentHistory(userId) }),
    onError: (error) => logger.error(error),
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
