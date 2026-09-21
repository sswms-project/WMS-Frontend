import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  InboundAllowedActionsResponse,
  InboundDocumentImport,
  InboundListQuery,
  GoodsReceiptDetail,
  GoodsReceiptListResponse,
  PutawayRequest,
  PutawayTaskQuery,
  ReceivingTaskListResponse,
  ReceivingTaskQuery,
  SaveGoodsReceiptRequest,
  StartInboundDocumentImportRequest,
  ReviewInboundDocumentImportRequest,
} from '../types/inbound.types'

export const inboundService = {
  getReceivingTasks: (params: ReceivingTaskQuery) =>
    axiosClient
      .get<
        ApiResponse<ReceivingTaskListResponse>
      >(API_ENDPOINTS.goodsReceipts.receivingTasks, { params })
      .then((response) => response.data),
  getReceipts: (params: InboundListQuery) =>
    axiosClient
      .get<ApiResponse<GoodsReceiptListResponse>>(API_ENDPOINTS.goodsReceipts.list, { params })
      .then((response) => response.data),
  getPutawayTasks: (params: PutawayTaskQuery) =>
    axiosClient
      .get<
        ApiResponse<GoodsReceiptListResponse>
      >(API_ENDPOINTS.goodsReceipts.putawayTasks, { params })
      .then((response) => response.data),
  getReceipt: (receiptId: string) =>
    axiosClient
      .get<ApiResponse<GoodsReceiptDetail>>(API_ENDPOINTS.goodsReceipts.detail(receiptId))
      .then((response) => response.data),
  getAllowedActions: (receiptId: string) =>
    axiosClient
      .get<
        ApiResponse<InboundAllowedActionsResponse>
      >(API_ENDPOINTS.goodsReceipts.allowedActions(receiptId))
      .then((response) => response.data),
  createReceipt: (request: SaveGoodsReceiptRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.goodsReceipts.create, request)
      .then((response) => response.data),
  updateReceipt: (receiptId: string, request: Omit<SaveGoodsReceiptRequest, 'inboundRequestId'>) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.goodsReceipts.update(receiptId), request)
      .then((response) => response.data),
  submitReceipt: (receiptId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.goodsReceipts.submit(receiptId))
      .then((response) => response.data),
  approveReceipt: (receiptId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.goodsReceipts.approve(receiptId))
      .then((response) => response.data),
  rejectReceipt: (receiptId: string, reason: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.goodsReceipts.reject(receiptId), { reason })
      .then((response) => response.data),
  putaway: (receiptId: string, request: PutawayRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.goodsReceipts.putaway(receiptId), request)
      .then((response) => response.data),
  startDocumentImport: ({
    file,
    inboundRequestId,
    warehouseId,
  }: StartInboundDocumentImportRequest) => {
    const formData = new FormData()
    formData.append('file', file)
    if (inboundRequestId) formData.append('inboundRequestId', inboundRequestId)
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
