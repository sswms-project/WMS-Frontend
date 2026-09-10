import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CommitPersonnelImportRequest,
  PersonnelImportDetails,
} from '../types/invitation.types'

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const personnelImportService = {
  downloadTemplate: async (format: 'xlsx' | 'csv') => {
    const response = await axiosClient.get<Blob>(API_ENDPOINTS.personnelImports.template, {
      params: { format },
      responseType: 'blob',
    })
    downloadBlob(response.data, `kovia-personnel-import-template.${format}`)
  },

  preview: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('schemaVersion', '1.0')
    return axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.personnelImports.preview, form, {
        headers: { 'Content-Type': null },
      })
      .then((response) => response.data)
  },

  detail: (importId: string) =>
    axiosClient
      .get<ApiResponse<PersonnelImportDetails>>(API_ENDPOINTS.personnelImports.detail(importId))
      .then((response) => response.data),

  cancel: (importId: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.personnelImports.detail(importId))
      .then((response) => response.data),

  commit: (importId: string, request: CommitPersonnelImportRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.personnelImports.commit(importId), request)
      .then((response) => response.data),
}
