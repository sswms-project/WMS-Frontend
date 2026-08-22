import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { invitationService } from './invitation.service'

const axios = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('@/lib/axios', () => ({
  axiosClient: axios,
}))

describe('invitationService', () => {
  beforeEach(() => axios.post.mockReset())

  it('sends only fields supported by the invitation endpoint', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    const request = { email: 'staff@example.com', role: USER_ROLES.WarehouseStaff }
    axios.post.mockResolvedValue({ data: response })

    await expect(invitationService.send(request)).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith(API_ENDPOINTS.invitations.send, request)
  })

  it('accepts an invitation by token with the current request contract', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    const request = { fullName: 'Nguyen Van A', password: 'abcdefgh' }
    axios.post.mockResolvedValue({ data: response })

    await expect(invitationService.accept('invite-token', request)).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.invitations.accept('invite-token'),
      request
    )
  })

  it('does not expose invitation operations missing from the backend controller', () => {
    expect(invitationService).not.toHaveProperty('getInvitations')
    expect(invitationService).not.toHaveProperty('resend')
    expect(invitationService).not.toHaveProperty('revoke')
  })
})
