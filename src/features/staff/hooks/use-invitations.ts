import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { invitationService } from '../services/invitation.service'
import type {
  AcceptInvitationRequest,
  InvitationQuery,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
    onError: (error) => logger.error(error),
  })
}

export function useAcceptInvitationMutation() {
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, AcceptInvitationVariables>({
    mutationFn: ({ token, request }) => invitationService.accept(token, request),
    onError: (error) => logger.error(error),
  })
}

export function useInvitationsQuery(params: InvitationQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.staff.invitations(params),
    queryFn: () => invitationService.list(params),
    enabled,
    select: (data) => data.data,
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
