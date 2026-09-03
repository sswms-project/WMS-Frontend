import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import type { UpdateTenantRolePermissionsInput } from '../schemas/update-tenant-role-permissions.schema'
import { tenantAccessControlService } from '../services/tenant-access-control.service'
import type { TenantRolePermissionWorkspace } from '../types/tenant-access-control.types'

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
