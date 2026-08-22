import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { invitationService } from '../services/invitation.service'
import type { AcceptInvitationRequest, SendInvitationRequest } from '../types/invitation.types'

interface AcceptInvitationVariables {
  token: string
  request: AcceptInvitationRequest
}

export function useSendInvitationMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, SendInvitationRequest>({
    mutationFn: invitationService.send,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
    onError: (error) => console.error(error),
  })
}

export function useAcceptInvitationMutation() {
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, AcceptInvitationVariables>({
    mutationFn: ({ token, request }) => invitationService.accept(token, request),
    onError: (error) => console.error(error),
  })
}
