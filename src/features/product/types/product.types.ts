export interface UnitResponse {
  id: string
  unitCode: string
  unitName: string
  symbol: string | null
  quantityPrecision: number
  description: string | null
  status: MasterDataStatus
  createdAt: string
  modifiedAt: string | null
}

export interface CategoryResponse {
  id: string
  categoryName: string
  description: string | null
  status: ProductStatus
  createdAt: string
  modifiedAt: string | null
}

export type MasterDataStatus = 'Active' | 'Inactive'
export type ProductStatus = 'Active' | 'Inactive'

export interface SaveUnitRequest {
  unitCode: string
  unitName: string
  symbol: string | null
  quantityPrecision: number
  description: string | null
}

export interface SaveCategoryRequest {
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
  status: ProductStatus
  barcodeValue: string | null
  isLotTracked: boolean
  shelfLifeDays: number | null
  canChangeBaseUnit: boolean
  canChangeTrackingMode: boolean
  createdAt: string
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
  isLotTracked: boolean
  shelfLifeDays: number | null
}

export interface UpdateProductRequest {
  productName: string
  unitId: string
  categoryId: string
  isLotTracked: boolean
  shelfLifeDays: number | null
}

export interface ConfigureStockPolicyRequest {
  warehouseId: string
  minStockThreshold: number
  maxStockThreshold: number | null
  reorderPoint: number | null
  safetyStock: number
  leadTimeDays: number | null
}

export interface ProductWarehousePolicy {
  id: string
  productId: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  minStockThreshold: number
  maxStockThreshold: number | null
  reorderPoint: number | null
  safetyStock: number
  leadTimeDays: number | null
  abcClass: string | null
  abcClassifiedAt: string | null
  status: MasterDataStatus
  createdAt: string
  modifiedAt: string | null
}

export interface ProductUnitConversion {
  id: string
  productId: string
  unitId: string
  unitCode: string
  unitName: string
  unitSymbol: string | null
  quantityPrecision: number
  conversionFactor: number
  status: MasterDataStatus
  createdAt: string
  modifiedAt: string | null
}

export interface CreateProductUnitConversionRequest {
  unitId: string
  conversionFactor: number
}

export interface UpdateProductUnitConversionRequest {
  conversionFactor: number
}

export const PRODUCT_LOT_STATUSES = ['Active', 'Expired', 'Blocked'] as const
export type ProductLotStatus = (typeof PRODUCT_LOT_STATUSES)[number]

export interface ProductLotQuery {
  warehouseId?: string
  onlyAvailable?: boolean
  status?: ProductLotStatus
  expiresOnOrBefore?: string
}

export interface ProductLot {
  id: string
  productId: string
  lotNumber: string
  supplierId: string | null
  supplierName: string | null
  manufacturedDate: string | null
  expiryDate: string | null
  status: ProductLotStatus
  quantityOnHand: number
  reservedQuantity: number
  availableQuantity: number
}

export interface ImportProductItemRequest {
  sku: string
  productName: string
  unitId: string
  categoryId: string
  isLotTracked?: boolean
  shelfLifeDays?: number | null
}

export interface ImportProductsRequest {
  items: ImportProductItemRequest[]
}

export interface ProductSupplier {
  id: string
  productId: string
  productSKU: string
  productName: string
  supplierId: string
  supplierName: string
  supplierStatus: 'Active' | 'Inactive'
  supplierProductCode: string | null
  isPreferred: boolean
  createdAt: string
  modifiedAt: string | null
}

export interface SaveProductSupplierRequest {
  supplierId: string
  supplierProductCode: string | null
  isPreferred: boolean
}

export type UpdateProductSupplierRequest = Omit<SaveProductSupplierRequest, 'supplierId'>
