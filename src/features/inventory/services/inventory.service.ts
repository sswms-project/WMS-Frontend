import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  InventoryStockListResponse,
  InventoryReservationListResponse,
  InventoryAbcItem,
  InventoryAbcQuery,
  InventoryForecastQuery,
  InventoryForecastResponse,
  InventoryListQuery,
  InventoryReservationQuery,
  InventoryStockHistoryQuery,
  InventoryStockHistoryResponse,
  CreateForecastRunRequest,
  ForecastRun,
  AcceptReplenishmentSuggestionRequest,
  AcceptRebalancingSuggestionRequest,
  ForecastSuggestionType,
  ReportDamagedStockRequest,
  RunInventoryAbcRequest,
  ApplyInventoryAbcRequest,
  StockMovementListQuery,
  StockMovementListResponse,
  DamageCaseQuery,
  DamageCaseListResponse,
  DecideDamageCaseDispositionRequest,
  OpeningStockQuery,
  OpeningStockListResponse,
  CreateOpeningStockRequest,
  UpdateOpeningStockRequest,
  InventoryEvidence,
  StockDiscrepancyListResponse,
  StockDiscrepancyQuery,
  CreateStockDiscrepancyRequest,
  ReviewStockDiscrepancyRequest,
  AddStockDiscrepancyEvidenceRequest,
  AddDamageCaseEvidenceRequest,
  MyWarehouseTaskListResponse,
} from '../types/inventory.types'

export const inventoryService = {
  downloadEvidence: async (id: string, fileName: string) => {
    const response = await axiosClient.get<Blob>(API_ENDPOINTS.inventory.evidenceFile(id), {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data)
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      URL.revokeObjectURL(url)
    }
  },
  getMyWarehouseTasks: (warehouseId?: string) =>
    axiosClient
      .get<ApiResponse<MyWarehouseTaskListResponse>>(API_ENDPOINTS.myWarehouseTasks.current, {
        params: { pageNumber: 1, pageSize: 100, ...(warehouseId ? { warehouseId } : {}) },
      })
      .then((response) => response.data),
  uploadEvidence: (warehouseId: string, file: File) => {
    const formData = new FormData()
    formData.append('warehouseId', warehouseId)
    formData.append('file', file)
    return axiosClient
      .post<ApiResponse<InventoryEvidence>>(API_ENDPOINTS.inventory.evidence, formData)
      .then((response) => response.data)
  },
  getInventory: (params: InventoryListQuery) =>
    axiosClient
      .get<ApiResponse<InventoryStockListResponse>>(API_ENDPOINTS.inventory.list, { params })
      .then((response) => response.data),
  getStockMovements: (params: StockMovementListQuery) =>
    axiosClient
      .get<ApiResponse<StockMovementListResponse>>(API_ENDPOINTS.inventory.movements, { params })
      .then((response) => response.data),
  getReservations: (params: InventoryReservationQuery) =>
    axiosClient
      .get<ApiResponse<InventoryReservationListResponse>>(API_ENDPOINTS.inventory.reservations, {
        params,
      })
      .then((response) => response.data),
  reportDamagedStock: (request: ReportDamagedStockRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.damaged, request)
      .then((response) => response.data),
  getDamageCases: (params: DamageCaseQuery) =>
    axiosClient
      .get<ApiResponse<DamageCaseListResponse>>(API_ENDPOINTS.inventory.damageCases, { params })
      .then((response) => response.data),
  getDiscrepancies: (params: StockDiscrepancyQuery) =>
    axiosClient
      .get<
        ApiResponse<StockDiscrepancyListResponse>
      >(API_ENDPOINTS.inventory.discrepancies, { params })
      .then((response) => response.data),
  createDiscrepancy: (request: CreateStockDiscrepancyRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.discrepancies, request)
      .then((response) => response.data),
  reviewDiscrepancy: (request: ReviewStockDiscrepancyRequest) =>
    axiosClient
      .post<
        ApiResponse<string | null>
      >(API_ENDPOINTS.inventory.reviewDiscrepancy(request.reportId), request)
      .then((response) => response.data),
  addDiscrepancyEvidence: (request: AddStockDiscrepancyEvidenceRequest) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.inventory.addDiscrepancyEvidence(request.reportId), request)
      .then((response) => response.data),
  decideDamageCaseDisposition: (request: DecideDamageCaseDispositionRequest) =>
    axiosClient
      .post<
        ApiResponse<string | null>
      >(API_ENDPOINTS.inventory.damageCaseDisposition(request.damageCaseId), request)
      .then((response) => response.data),
  addDamageCaseEvidence: (request: AddDamageCaseEvidenceRequest) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.inventory.addDamageCaseEvidence(request.damageCaseId), request)
      .then((response) => response.data),
  getOpeningStocks: (params: OpeningStockQuery) =>
    axiosClient
      .get<ApiResponse<OpeningStockListResponse>>(API_ENDPOINTS.inventory.openingStocks, { params })
      .then((response) => response.data),
  createOpeningStock: (request: CreateOpeningStockRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.openingStocks, request)
      .then((response) => response.data),
  updateOpeningStock: ({ id, ...request }: UpdateOpeningStockRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.inventory.updateOpeningStock(id), {
        openingStockId: id,
        ...request,
      })
      .then((response) => response.data),
  submitOpeningStock: (id: string, expectedVersion: string) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.inventory.submitOpeningStock(id), { openingStockId: id, expectedVersion })
      .then((response) => response.data),
  withdrawOpeningStock: (id: string, reason: string, expectedVersion: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.withdrawOpeningStock(id), {
        openingStockId: id,
        reason,
        expectedVersion,
      })
      .then((response) => response.data),
  approveOpeningStock: (id: string, expectedVersion: string) =>
    axiosClient
      .post<
        ApiResponse<string>
      >(API_ENDPOINTS.inventory.approveOpeningStock(id), { openingStockId: id, expectedVersion, commandId: crypto.randomUUID() })
      .then((response) => response.data),
  reviewOpeningStock: (
    id: string,
    request: {
      decision: 'Returned' | 'Rejected' | 'Cancelled'
      reason: string
      expectedVersion: string
    }
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.inventory.reviewOpeningStock(id), { openingStockId: id, ...request })
      .then((response) => response.data),
  cancelOpeningStock: (id: string, reason: string, expectedVersion: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.cancelOpeningStock(id), {
        openingStockId: id,
        decision: 'Cancelled',
        reason,
        expectedVersion,
      })
      .then((response) => response.data),
  getAbcClassification: (params: InventoryAbcQuery) =>
    axiosClient
      .get<ApiResponse<InventoryAbcItem[]>>(API_ENDPOINTS.inventory.abcClassification, { params })
      .then((response) => response.data),
  runAbcClassification: (request: RunInventoryAbcRequest) =>
    axiosClient
      .post<ApiResponse<InventoryAbcItem[]>>(API_ENDPOINTS.inventory.runAbcClassification, request)
      .then((response) => response.data),
  applyAbcAnalysis: ({ analysisId, ...request }: ApplyInventoryAbcRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.applyAbcAnalysis(analysisId), {
        analysisId,
        ...request,
      })
      .then((response) => response.data),
  getForecast: (params: InventoryForecastQuery) =>
    axiosClient
      .get<ApiResponse<InventoryForecastResponse>>(API_ENDPOINTS.inventory.forecast, { params })
      .then((response) => response.data),
  createForecastRun: (request: CreateForecastRunRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.forecastRuns, request)
      .then((response) => response.data),
  executeForecastRun: (id: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.executeForecastRun(id))
      .then((response) => response.data),
  getForecastRun: (id: string) =>
    axiosClient
      .get<ApiResponse<ForecastRun>>(API_ENDPOINTS.inventory.forecastRun(id))
      .then((response) => response.data),
  evaluateForecastRun: (id: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.evaluateForecastRun(id))
      .then((response) => response.data),
  acceptReplenishmentSuggestion: (id: string, request: AcceptReplenishmentSuggestionRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.acceptReplenishmentSuggestion(id), request)
      .then((response) => response.data),
  acceptRebalancingSuggestion: (id: string, request: AcceptRebalancingSuggestionRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inventory.acceptRebalancingSuggestion(id), request)
      .then((response) => response.data),
  rejectForecastSuggestion: (id: string, suggestionType: ForecastSuggestionType) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inventory.rejectForecastSuggestion(id), {
        suggestionType,
      })
      .then((response) => response.data),
  getStockHistory: (params: InventoryStockHistoryQuery) =>
    axiosClient
      .get<ApiResponse<InventoryStockHistoryResponse>>(API_ENDPOINTS.inventory.history, { params })
      .then((response) => response.data),
}
