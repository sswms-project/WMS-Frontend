import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import type { ResetTenantUserPermissionsInput } from '../schemas/reset-tenant-user-permissions.schema'
import type { UpdateTenantUserPermissionsInput } from '../schemas/update-tenant-user-permissions.schema'
import type { UpdateTenantRolePermissionsInput } from '../schemas/update-tenant-role-permissions.schema'
import { tenantAccessControlService } from '../services/tenant-access-control.service'
import type {
  TenantRolePermissionWorkspace,
  TenantUserPermissionSubject,
  TenantUserPermissionSubjectQuery,
  TenantUserPermissionWorkspace,
} from '../types/tenant-access-control.types'
import { getPersonalPermissionErrorDetails } from '../utils/tenant-user-permission-error'

export function useTenantAccessControlQuery() {
  return useQuery<TenantRolePermissionWorkspace, ApiErrorResponse>({
    queryKey: queryKeys.tenantRolePermissions.workspace,
    queryFn: () => tenantAccessControlService.getWorkspace().then((response) => response.data),
  })
}

export interface UpdateTenantRolePermissionsVariables {
  roleId: string
  body: UpdateTenantRolePermissionsInput
}

export function useUpdateTenantRolePermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateTenantRolePermissionsVariables>({
    mutationFn: ({ roleId, body }) => tenantAccessControlService.assignPermissions(roleId, body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tenantRolePermissions.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
      ]),
    onError: (error) => {
      logger.error(error.message, error)
      toast.error(error.message ?? 'Không thể cập nhật quyền truy cập. Vui lòng thử lại.')
    },
  })
}

export function usePermissionSubjectsQuery(
  params: TenantUserPermissionSubjectQuery,
  enabled = true
) {
  return useQuery<QueryResult<TenantUserPermissionSubject>, ApiErrorResponse>({
    queryKey: queryKeys.tenantUserPermissions.subjects(params),
    queryFn: () => tenantAccessControlService.getSubjects(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useTenantUserPermissionsQuery(userId: string | null, enabled = true) {
  return useQuery<TenantUserPermissionWorkspace, ApiErrorResponse>({
    queryKey: queryKeys.tenantUserPermissions.detail(userId ?? ''),
    queryFn: () =>
      tenantAccessControlService.getUserWorkspace(userId ?? '').then((response) => response.data),
    enabled: enabled && Boolean(userId),
  })
}

export interface UpdateTenantUserPermissionsVariables {
  userId: string
  body: UpdateTenantUserPermissionsInput
}

export function useUpdateTenantUserPermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, unknown, UpdateTenantUserPermissionsVariables>({
    mutationFn: ({ userId, body }) =>
      tenantAccessControlService.assignUserPermissions(userId, body),
    onSuccess: (_, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tenantUserPermissions.detail(variables.userId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tenantUserPermissions.allSubjects,
        }),
      ]),
    onError: (error) => {
      const details = getPersonalPermissionErrorDetails(error)
      logger.error(formatApiError(error), error)
      toast.error(details.message)
    },
  })
}

export interface ResetTenantUserPermissionsVariables {
  userId: string
  body: ResetTenantUserPermissionsInput
}

export function useResetTenantUserPermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, unknown, ResetTenantUserPermissionsVariables>({
    mutationFn: ({ userId, body }) => tenantAccessControlService.resetUserPermissions(userId, body),
    onSuccess: (_, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tenantUserPermissions.detail(variables.userId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tenantUserPermissions.allSubjects,
        }),
      ]),
    onError: (error) => {
      const details = getPersonalPermissionErrorDetails(error)
      logger.error(formatApiError(error), error)
      toast.error(details.message)
    },
  })
}
