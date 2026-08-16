import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import { invitationService } from '../services/invitation.service'
import type {
  AcceptInvitationRequest,
  InvitationQuery,
  InvitationResponse,
  SendInvitationRequest,
} from '../types/invitation.types'

interface AcceptInvitationVariables {
  token: string
  request: AcceptInvitationRequest
}

export function useInvitationsQuery(params: InvitationQuery, enabled = true) {
  return useQuery<QueryResult<InvitationResponse>, ApiErrorResponse>({
    queryKey: queryKeys.invitations.list(params),
    queryFn: () => invitationService.getInvitations(params).then((response) => response.data),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useSendInvitationMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, SendInvitationRequest>({
    mutationFn: invitationService.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all })
    },
    onError: (error) => console.error(error),
  })
}

export function useAcceptInvitationMutation() {
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, AcceptInvitationVariables>({
    mutationFn: ({ token, request }) => invitationService.accept(token, request),
    onError: (error) => console.error(error),
  })
}

function useInvitationActionMutation(action: 'resend' | 'revoke') {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: action === 'resend' ? invitationService.resend : invitationService.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all }),
    onError: (error) => console.error(error),
  })
}

export function useResendInvitationMutation() {
  return useInvitationActionMutation('resend')
}

export function useRevokeInvitationMutation() {
  return useInvitationActionMutation('revoke')
}
