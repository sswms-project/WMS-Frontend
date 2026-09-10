import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import { invitationService } from '../services/invitation.service'
import type {
  AcceptInvitationRequest,
  InvitationQuery,
  InvitationPreviewResponse,
  InvitationResponse,
  SendInvitationRequest,
} from '../types/invitation.types'

interface AcceptInvitationVariables {
  token: string
  request: AcceptInvitationRequest
}

export function useSendInvitationMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, SendInvitationRequest>({
    mutationFn: invitationService.send,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.allInvitations }),
    onError: (error) => logger.error(error),
  })
}

export function useAcceptInvitationMutation() {
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, AcceptInvitationVariables>({
    mutationFn: ({ token, request }) => invitationService.acceptNew(token, request),
    onError: (error) => logger.error(error),
  })
}

export function useInvitationPreviewQuery(token: string) {
  return useQuery<InvitationPreviewResponse, ApiErrorResponse>({
    queryKey: queryKeys.staff.invitationPreview(token),
    queryFn: () => invitationService.preview(token).then((response) => response.data),
    enabled: Boolean(token),
    retry: false,
  })
}

export function useAcceptExistingInvitationMutation() {
  return useMutation<ApiResponse<string>, ApiErrorResponse, string>({
    mutationFn: invitationService.acceptExisting,
    onError: (error) => logger.error(error),
  })
}

export function useInvitationsQuery(params: InvitationQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.staff.invitations(params),
    queryFn: () => invitationService.list(params),
    enabled,
    select: (data) => data.data as unknown as QueryResult<InvitationResponse>,
  })
}

export function useResendInvitationMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: invitationService.resend,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.allInvitations }),
    onError: (error) => logger.error(error),
  })
}

export function useRevokeInvitationMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: invitationService.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.allInvitations }),
    onError: (error) => logger.error(error),
  })
}
