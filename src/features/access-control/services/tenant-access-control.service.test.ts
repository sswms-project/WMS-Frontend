import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { tenantAccessControlService } from './tenant-access-control.service'

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}))

const response = { isSuccess: true, statusCode: 200, message: 'OK', data: null }

describe('tenantAccessControlService personal permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    vi.mocked(axiosClient.put).mockResolvedValue({ data: response })
    vi.mocked(axiosClient.post).mockResolvedValue({ data: response })
  })

  it('builds the exact subject list and detail requests', async () => {
    const params = {
      top: 20,
      skip: 20,
      needTotalCount: true as const,
      roleId: '51b3dc62-d48a-422c-bdcf-a5e6e3ec1498',
      searchText: 'nguyễn',
    }

    await tenantAccessControlService.getSubjects(params)
    await tenantAccessControlService.getUserWorkspace('79e8c85b-7786-44d5-b507-bb44e722adcb')

    expect(axiosClient.get).toHaveBeenNthCalledWith(
      1,
      API_ENDPOINTS.tenantUserPermissions.subjects,
      {
        params,
      }
    )
    expect(axiosClient.get).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.tenantUserPermissions.detail('79e8c85b-7786-44d5-b507-bb44e722adcb')
    )
  })

  it('sends the complete effective selection and expected role on save and reset', async () => {
    const userId = '79e8c85b-7786-44d5-b507-bb44e722adcb'
    const expectedRoleId = '1a13e448-0388-da07-2782-cf395c564951'
    const permissionId = 'a73b60fa-0e18-49bc-936c-bc568b72b486'

    await tenantAccessControlService.assignUserPermissions(userId, {
      expectedRoleId,
      permissionIds: [permissionId],
    })
    await tenantAccessControlService.resetUserPermissions(userId, { expectedRoleId })

    expect(axiosClient.put).toHaveBeenCalledWith(
      API_ENDPOINTS.tenantUserPermissions.assign(userId),
      {
        expectedRoleId,
        permissionIds: [permissionId],
      }
    )
    expect(axiosClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.tenantUserPermissions.reset(userId),
      { expectedRoleId }
    )
  })
})
