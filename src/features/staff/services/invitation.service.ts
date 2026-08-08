import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type { AcceptInvitationRequest, SendInvitationRequest } from '../types/invitation.types'

export const invitationService = {
  send: (request: SendInvitationRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.invitations.send, request)
      .then((response) => response.data),

  accept: (token: string, request: AcceptInvitationRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.invitations.accept(token), request)
      .then((response) => response.data),
}
