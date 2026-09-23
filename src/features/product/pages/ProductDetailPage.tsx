'use client'

import { useState } from 'react'
import { ArrowLeft, Boxes, Pencil, QrCode, RefreshCw, Settings2, Store } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  ProductDetailSidebar,
  ProductBarcodePanel,
  ProductSuppliersPanel,
  ProductLotsPanel,
  ProductWarehousePoliciesPanel,
} from '../components/ProductDetailPage'
import { UpdateProductDialog } from '../components/ProductForm'
import { ProductStockPolicyDialog } from '../components/ProductStockPolicyForm'
import {
  useProductDetailQuery,
  useCategoriesQuery,
  useUpdateProductMutation,
  useConfigureStockPolicyMutation,
  useGenerateBarcodeMutation,
  useProductLotsQuery,
  useProductStockPoliciesQuery,
  useUpdateProductLotStatusMutation,
  useUnitsQuery,
} from '../hooks/use-products'
import type { StockPolicyFormValues, UpdateProductFormValues } from '../schemas/product.schema'
import type { ProductLot, ProductLotStatus } from '../types/product.types'

interface ProductDetailPageProps {
  readonly productId: string
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isStockPolicyOpen, setIsStockPolicyOpen] = useState(false)
  const [lotWarehouseId, setLotWarehouseId] = useState('')
  const [lotStatus, setLotStatus] = useState<ProductLotStatus | ''>('')
  const [onlyAvailableLots, setOnlyAvailableLots] = useState(false)
  const [expiresOnOrBefore, setExpiresOnOrBefore] = useState('')

  const detailQuery = useProductDetailQuery(productId)
  const meQuery = useMeQuery()
  const updateMutation = useUpdateProductMutation(productId)
  const stockPolicyMutation = useConfigureStockPolicyMutation(productId)
  const barcodeMutation = useGenerateBarcodeMutation(productId)
  const policiesQuery = useProductStockPoliciesQuery(productId)
  const warehousesQuery = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true })
  const lotsQuery = useProductLotsQuery(
    productId,
    {
      ...(lotWarehouseId ? { warehouseId: lotWarehouseId } : {}),
      ...(lotStatus ? { status: lotStatus } : {}),
      ...(onlyAvailableLots ? { onlyAvailable: true } : {}),
      ...(expiresOnOrBefore ? { expiresOnOrBefore } : {}),
    },
    Boolean(detailQuery.data?.isLotTracked)
  )
  const lotStatusMutation = useUpdateProductLotStatusMutation(productId)
  const unitsQuery = useUnitsQuery(isEditOpen)
  const categoriesQuery = useCategoriesQuery(isEditOpen)

  const product = detailQuery.data
  const permissions = new Set(meQuery.data?.permissions ?? [])
  const canUpdate = permissions.has(P.PRODUCTS_UPDATE)
  const canConfigureStockPolicy = permissions.has(P.PRODUCTS_CONFIGURE_POLICY)
  const canGenerateBarcode = permissions.has(P.PRODUCTS_GENERATE_BARCODE)

  async function handleUpdate(values: UpdateProductFormValues) {
    try {
      await updateMutation.mutateAsync(values)
      toast.success('Đã cập nhật sản phẩm.')
      setIsEditOpen(false)
    } catch (error) {
      logger.error(formatApiError(error))
      const message = getApiErrorMessage(error, 'Không thể cập nhật sản phẩm.')
      toast.error(message)
      if (
        message ===
        'Không thể thay đổi phương thức quản lý tồn kho vì sản phẩm đã phát sinh dữ liệu kho.'
      ) {
        await detailQuery.refetch()
      }
    }
  }

  async function handleLotStatusUpdate(lot: ProductLot, status: 'Active' | 'Blocked') {
    try {
      await lotStatusMutation.mutateAsync({ lotId: lot.id, status })
      toast.success(status === 'Blocked' ? 'Đã khóa lô.' : 'Đã mở khóa lô.')
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái lô.'))
    }
  }

  async function handleStockPolicy(values: StockPolicyFormValues) {
    try {
      await stockPolicyMutation.mutateAsync(values)
      toast.success('Đã cập nhật chính sách tồn kho.')
      setIsStockPolicyOpen(false)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật chính sách tồn kho.'))
    }
  }

  async function handleGenerateBarcode() {
    try {
      await barcodeMutation.mutateAsync()
      toast.success('Đã tạo mã vạch.')
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể tạo mã vạch.'))
    }
  }

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (detailQuery.isError || !product) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">Không thể tải thông tin sản phẩm</p>
        <Button
          type="button"
          variant="outline"
          disabled={detailQuery.isFetching}
          onClick={() => void detailQuery.refetch()}
        >
          <RefreshCw
            className={detailQuery.isFetching ? 'size-4 animate-spin' : 'size-4'}
            aria-hidden="true"
          />
          Thử lại
        </Button>
      </div>
    )
  }

  const requestedTab = searchParams.get('tab')
  const activeTab =
    requestedTab === 'stock' ||
    requestedTab === 'barcode' ||
    requestedTab === 'suppliers' ||
    (requestedTab === 'lots' && product.isLotTracked)
      ? requestedTab
      : 'info'

  function handleTabChange(tab: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (tab === 'info') next.delete('tab')
    else next.set('tab', tab)
    const query = next.toString()
    window.history.pushState(null, '', query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Quay lại"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => router.push(APP_ROUTES.products as any)}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Button>
          <h1 className="text-lg font-semibold">Chi tiết sản phẩm</h1>
        </div>
        {canUpdate ? (
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={() => setIsEditOpen(true)}>
              <Pencil data-icon="inline-start" aria-hidden="true" />
              Chỉnh sửa
            </Button>
          </div>
        ) : null}
      </div>

      {/* Two-column layout */}
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left sidebar */}
        <div className="lg:sticky lg:top-20">
          <ProductDetailSidebar product={product} />
        </div>

        {/* Right tabbed panel */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="min-w-0">
          <TabsList
            variant="line"
            aria-label="Các phần thông tin sản phẩm"
            className="scroll-fade-x h-10 w-full max-w-full justify-start overflow-x-auto border-b p-0"
          >
            <TabsTrigger value="info" className="h-10 flex-none px-3">
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger value="stock" className="h-10 flex-none px-3">
              <Settings2 aria-hidden="true" />
              Chính sách tồn kho
            </TabsTrigger>
            <TabsTrigger value="barcode" className="h-10 flex-none px-3">
              <QrCode aria-hidden="true" />
              Mã vạch
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="h-10 flex-none px-3">
              <Store aria-hidden="true" />
              Nhà cung cấp
            </TabsTrigger>
            {product.isLotTracked ? (
              <TabsTrigger value="lots" className="h-10 flex-none px-3">
                <Boxes aria-hidden="true" />
                Lô sản phẩm
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="bg-card space-y-4 rounded-lg border p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Tên sản phẩm
                  </p>
                  <p className="mt-1 text-sm font-medium">{product.productName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Mã SKU
                  </p>
                  <p className="mt-1 font-mono text-sm">{product.sku}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Danh mục
                  </p>
                  <p className="mt-1 text-sm">{product.categoryName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Đơn vị tính
                  </p>
                  <p className="mt-1 text-sm">{product.unitName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Quản lý tồn kho
                  </p>
                  <p className="mt-1 text-sm">
                    {product.isLotTracked ? 'Theo lô' : 'Theo số lượng'}
                  </p>
                </div>
                {product.isLotTracked ? (
                  <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Số ngày sử dụng dự kiến
                    </p>
                    <p className="mt-1 text-sm">{product.shelfLifeDays ?? 'Không cấu hình'}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="mt-4">
            <ProductWarehousePoliciesPanel
              policies={policiesQuery.data ?? []}
              isLoading={policiesQuery.isLoading}
              isError={policiesQuery.isError}
              canManage={canConfigureStockPolicy}
              onRetry={() => void policiesQuery.refetch()}
              onConfigure={() => setIsStockPolicyOpen(true)}
            />
          </TabsContent>

          <TabsContent value="barcode" className="mt-4">
            <div className="bg-card rounded-lg border">
              <ProductBarcodePanel
                sku={product.sku}
                barcodeValue={product.barcodeValue}
                canGenerate={canGenerateBarcode}
                isGenerating={barcodeMutation.isPending}
                onGenerate={() => void handleGenerateBarcode()}
              />
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-4">
            <ProductSuppliersPanel productId={productId} canManage={canUpdate} />
          </TabsContent>

          {product.isLotTracked ? (
            <TabsContent value="lots" className="mt-4">
              <ProductLotsPanel
                lots={lotsQuery.data ?? []}
                warehouses={(warehousesQuery.data?.items ?? []).filter(
                  (warehouse) => warehouse.status === 'Active'
                )}
                warehouseId={lotWarehouseId}
                status={lotStatus}
                onlyAvailable={onlyAvailableLots}
                expiresOnOrBefore={expiresOnOrBefore}
                isLoading={lotsQuery.isLoading}
                isError={lotsQuery.isError}
                isUpdating={lotStatusMutation.isPending}
                canManage={canUpdate}
                onWarehouseChange={setLotWarehouseId}
                onStatusChange={setLotStatus}
                onOnlyAvailableChange={setOnlyAvailableLots}
                onExpiryChange={setExpiresOnOrBefore}
                onRetry={() => void lotsQuery.refetch()}
                onStatusUpdate={(lot, status) => void handleLotStatusUpdate(lot, status)}
              />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>

      {canUpdate && isEditOpen && (
        <UpdateProductDialog
          units={unitsQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          areOptionsLoading={unitsQuery.isLoading || categoriesQuery.isLoading}
          areOptionsError={unitsQuery.isError || categoriesQuery.isError}
          onRetryOptions={() => {
            void unitsQuery.refetch()
            void categoriesQuery.refetch()
          }}
          open={isEditOpen}
          product={product}
          isPending={updateMutation.isPending}
          onOpenChange={setIsEditOpen}
          onSubmit={(values) => void handleUpdate(values)}
        />
      )}

      {canConfigureStockPolicy && isStockPolicyOpen && (
        <ProductStockPolicyDialog
          open={isStockPolicyOpen}
          warehouses={(warehousesQuery.data?.items ?? []).filter(
            (warehouse) => warehouse.status === 'Active'
          )}
          policies={policiesQuery.data ?? []}
          isPending={stockPolicyMutation.isPending}
          onOpenChange={setIsStockPolicyOpen}
          onSubmit={(values) => void handleStockPolicy(values)}
        />
      )}
    </div>
  )
}
