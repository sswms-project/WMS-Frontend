export interface UnitResponse {
  id: string
  unitName: string
  description: string | null
}

export interface CategoryResponse {
  id: string
  categoryName: string
  description: string | null
}

export interface ProductResponse {
  id: string
  sku: string
  productName: string
  unitId: string
  unitName: string
  categoryId: string | null
  categoryName: string | null
  status: string
  minStockThreshold: number | null
  barcodeValue: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductListResponse {
  items: ProductResponse[]
  totalCount: number
}

export interface ProductListQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
}

export interface CreateProductRequest {
  sku: string
  productName: string
  unitId: string
  categoryId: string
}

export interface UpdateProductRequest {
  productName: string
  unitId: string
  categoryId: string
}

export interface ConfigureStockPolicyRequest {
  minStockThreshold: number
}

export interface ImportProductItemRequest {
  sku: string
  productName: string
  unitId: string
  categoryId: string
  minStockThreshold: number
}

export interface ImportProductsRequest {
  items: ImportProductItemRequest[]
}
