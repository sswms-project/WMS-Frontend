import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type {
  AcceptInvitationRequest,
  InvitationPreviewResponse,
  InvitationQuery,
  InvitationResponse,
  SendInvitationRequest,
} from '../types/invitation.types'

export const invitationService = {
  send: (request: SendInvitationRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.invitations.send, request)
      .then((response) => response.data),

  preview: (token: string) =>
    axiosClient
      .get<ApiResponse<InvitationPreviewResponse>>(API_ENDPOINTS.invitations.preview(token))
      .then((response) => response.data),

  acceptNew: (token: string, request: AcceptInvitationRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.invitations.acceptNew(token), request)
      .then((response) => response.data),

  list: (params: InvitationQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<InvitationResponse>>>(API_ENDPOINTS.invitations.list, { params })
      .then((response) => response.data),

  resend: (id: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.invitations.resend(id))
      .then((response) => response.data),

  revoke: (id: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.invitations.revoke(id))
      .then((response) => response.data),
}
