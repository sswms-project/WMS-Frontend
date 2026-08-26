export type SupplierStatus = 'Active' | 'Inactive'

export interface SupplierListQuery {
  readonly pageNumber: number
  readonly pageSize: number
  readonly searchTerm?: string
  readonly status?: SupplierStatus
}

export interface Supplier {
  readonly id: string
  readonly supplierName: string
  readonly phone: string
  readonly email: string | null
  readonly address: string | null
  readonly status: SupplierStatus
  readonly createdAt: string
  readonly updatedAt: string | null
}

export interface SupplierListResponse {
  readonly items: Supplier[]
  readonly totalCount: number
  readonly pageNumber: number
  readonly pageSize: number
}

export interface SaveSupplierRequest {
  readonly supplierName: string
  readonly phone: string
  readonly email: string | null
  readonly address: string | null
}

export interface UpdateSupplierVariables {
  readonly supplierId: string
  readonly request: SaveSupplierRequest
}
