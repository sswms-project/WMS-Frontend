import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { personnelImportService } from './personnel-import.service'

const axios = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@/lib/axios', () => ({ axiosClient: axios }))

describe('personnelImportService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the file and frozen schema version as multipart preview fields', async () => {
    const file = new File(['FullName,Email,RoleCode,WarehouseCodes'], 'staff.csv', {
      type: 'text/csv',
    })
    const response = { isSuccess: true, statusCode: 200, message: '', data: 'import-id' }
    axios.post.mockResolvedValue({ data: response })

    await expect(personnelImportService.preview(file)).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledOnce()
    const [endpoint, form, config] = axios.post.mock.calls[0] as [
      string,
      FormData,
      { headers: { 'Content-Type': null } },
    ]
    expect(endpoint).toBe(API_ENDPOINTS.personnelImports.preview)
    expect(form.get('file')).toBe(file)
    expect(form.get('schemaVersion')).toBe('1.0')
    expect(config).toEqual({ headers: { 'Content-Type': null } })
  })

  it('uses exact detail, cancel and commit endpoints and payload names', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    axios.get.mockResolvedValue({ data: response })
    axios.delete.mockResolvedValue({ data: response })
    axios.post.mockResolvedValue({ data: response })
    const request = { selectedRowNumbers: [2, 4], rowVersion: 'AQID' }

    await personnelImportService.detail('import-id')
    await personnelImportService.cancel('import-id')
    await personnelImportService.commit('import-id', request)

    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.personnelImports.detail('import-id'))
    expect(axios.delete).toHaveBeenCalledWith(API_ENDPOINTS.personnelImports.detail('import-id'))
    expect(axios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.personnelImports.commit('import-id'),
      request
    )
  })
})
