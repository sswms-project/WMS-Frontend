import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { AdminSubscriptionPlanQuery, TenantQuery } from '../types/admin.types'
import { adminService } from './admin.service'

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const response = {
  data: { isSuccess: true, statusCode: 200, message: 'OK', data: { items: [] } },
}

describe('adminService platform administration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axiosClient.get).mockResolvedValue(response)
    vi.mocked(axiosClient.post).mockResolvedValue(response)
  })

  it('serializes tenant and plan filters on their admin endpoints', async () => {
    const tenantQuery: TenantQuery = {
      pageNumber: 2,
      pageSize: 20,
      search: 'Kovia',
      status: 'Active',
    }
    const planQuery: AdminSubscriptionPlanQuery = {
      pageNumber: 1,
      pageSize: 100,
      status: 'Inactive',
    }

    await adminService.getTenants(tenantQuery)
    await adminService.getSubscriptionPlans(planQuery)

    expect(axiosClient.get).toHaveBeenNthCalledWith(1, API_ENDPOINTS.platformAdmin.tenants, {
      params: tenantQuery,
    })
    expect(axiosClient.get).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.platformAdmin.subscriptionPlans,
      { params: planQuery }
    )
  })

  it('sends the required audit reason when suspending a tenant', async () => {
    await adminService.suspendTenant('tenant-1', { reason: 'Yêu cầu từ bộ phận tuân thủ' })

    expect(axiosClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.platformAdmin.suspendTenant('tenant-1'),
      { reason: 'Yêu cầu từ bộ phận tuân thủ' }
    )
  })
})
