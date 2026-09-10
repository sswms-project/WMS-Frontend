import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { personnelImportService } from '../services/personnel-import.service'
import type { CommitPersonnelImportRequest } from '../types/invitation.types'

interface CommitVariables extends CommitPersonnelImportRequest {
  importId: string
}

export function usePersonnelImportQuery(importId: string) {
  return useQuery({
    queryKey: queryKeys.staff.personnelImport(importId),
    queryFn: () => personnelImportService.detail(importId).then((response) => response.data),
    enabled: Boolean(importId),
    retry: false,
  })
}

export function usePersonnelImportPreviewMutation() {
  return useMutation<ApiResponse<string>, ApiErrorResponse, File>({
    mutationFn: personnelImportService.preview,
    onError: (error) => logger.error(error),
  })
}

export function usePersonnelImportCommitMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, CommitVariables>({
    mutationFn: ({ importId, selectedRowNumbers, rowVersion }) =>
      personnelImportService.commit(importId, { selectedRowNumbers, rowVersion }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.staff.personnelImport(variables.importId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.allInvitations }),
      ])
    },
    onError: (error) => logger.error(error),
  })
}

export function usePersonnelImportCancelMutation() {
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: personnelImportService.cancel,
    onError: (error) => logger.error(error),
  })
}

export function usePersonnelTemplateMutation() {
  return useMutation<void, ApiErrorResponse, 'xlsx' | 'csv'>({
    mutationFn: personnelImportService.downloadTemplate,
    onError: (error) => logger.error(error),
  })
}
