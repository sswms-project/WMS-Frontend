import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  InboundAllowedActionsResponse,
  InboundDocumentImport,
  InboundListQuery,
  InboundReceiptDetail,
  InboundReceiptListResponse,
  PutawayRequest,
  PutawayTaskQuery,
  ReceivingTaskListResponse,
  ReceivingTaskQuery,
  SaveInboundReceiptRequest,
  StartInboundDocumentImportRequest,
  ReviewInboundDocumentImportRequest,
} from '../types/inbound.types'

export const inboundService = {
  getReceivingTasks: (params: ReceivingTaskQuery) =>
    axiosClient
      .get<
        ApiResponse<ReceivingTaskListResponse>
      >(API_ENDPOINTS.inboundReceipts.receivingTasks, { params })
      .then((response) => response.data),
  getReceipts: (params: InboundListQuery) =>
    axiosClient
      .get<ApiResponse<InboundReceiptListResponse>>(API_ENDPOINTS.inboundReceipts.list, { params })
      .then((response) => response.data),
  getPutawayTasks: (params: PutawayTaskQuery) =>
    axiosClient
      .get<
        ApiResponse<InboundReceiptListResponse>
      >(API_ENDPOINTS.inboundReceipts.putawayTasks, { params })
      .then((response) => response.data),
  getReceipt: (receiptId: string) =>
    axiosClient
      .get<ApiResponse<InboundReceiptDetail>>(API_ENDPOINTS.inboundReceipts.detail(receiptId))
      .then((response) => response.data),
  getAllowedActions: (receiptId: string) =>
    axiosClient
      .get<
        ApiResponse<InboundAllowedActionsResponse>
      >(API_ENDPOINTS.inboundReceipts.allowedActions(receiptId))
      .then((response) => response.data),
  createReceipt: (request: SaveInboundReceiptRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inboundReceipts.create, request)
      .then((response) => response.data),
  updateReceipt: (receiptId: string, request: Omit<SaveInboundReceiptRequest, 'purchaseOrderId'>) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.inboundReceipts.update(receiptId), request)
      .then((response) => response.data),
  submitReceipt: (receiptId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundReceipts.submit(receiptId))
      .then((response) => response.data),
  approveReceipt: (receiptId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundReceipts.approve(receiptId))
      .then((response) => response.data),
  rejectReceipt: (receiptId: string, reason: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundReceipts.reject(receiptId), { reason })
      .then((response) => response.data),
  putaway: (receiptId: string, request: PutawayRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundReceipts.putaway(receiptId), request)
      .then((response) => response.data),
  startDocumentImport: ({
    file,
    purchaseOrderId,
    warehouseId,
  }: StartInboundDocumentImportRequest) => {
    const formData = new FormData()
    formData.append('file', file)
    if (purchaseOrderId) formData.append('purchaseOrderId', purchaseOrderId)
    if (warehouseId) formData.append('warehouseId', warehouseId)
    return axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inboundDocumentImports.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90_000,
      })
      .then((response) => response.data)
  },
  getDocumentImport: (importId: string) =>
    axiosClient
      .get<
        ApiResponse<InboundDocumentImport>
      >(API_ENDPOINTS.inboundDocumentImports.detail(importId))
      .then((response) => response.data),
  reviewDocumentImport: ({ id, ...request }: ReviewInboundDocumentImportRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.inboundDocumentImports.review(id), request)
      .then((response) => response.data),
  createDraftFromDocument: (importId: string) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inboundDocumentImports.createDraft(importId))
      .then((response) => response.data),
}
