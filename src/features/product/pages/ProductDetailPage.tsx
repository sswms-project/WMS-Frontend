'use client'

import { useState } from 'react'
import { Archive, ArrowLeft, Pencil, QrCode, RefreshCw, Settings2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APP_ROUTES } from '@/routes/app-routes'
import { ProductDetailSidebar, ProductBarcodePanel } from '../components/ProductDetailPage'
import { UpdateProductDialog } from '../components/ProductForm'
import { ProductArchiveDialog } from '../components/ProductArchiveDialog'
import { ProductStockPolicyDialog } from '../components/ProductStockPolicyForm'
import {
  useProductDetailQuery,
  useUpdateProductMutation,
  useConfigureStockPolicyMutation,
  useGenerateBarcodeMutation,
} from '../hooks/use-products'
import type { StockPolicyFormValues, UpdateProductFormValues } from '../schemas/product.schema'

interface ProductDetailPageProps {
  readonly productId: string
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [isStockPolicyOpen, setIsStockPolicyOpen] = useState(false)

  const detailQuery = useProductDetailQuery(productId)
  const meQuery = useMeQuery()
  const updateMutation = useUpdateProductMutation(productId)
  const stockPolicyMutation = useConfigureStockPolicyMutation(productId)
  const barcodeMutation = useGenerateBarcodeMutation(productId)

  const product = detailQuery.data
  const permissions = new Set(meQuery.data?.permissions ?? [])
  const canUpdate = permissions.has('products:update')
  const canConfigureStockPolicy = permissions.has('products:configure-policy')
  const canGenerateBarcode = permissions.has('products:generate-barcode')

  async function handleUpdate(values: UpdateProductFormValues) {
    try {
      await updateMutation.mutateAsync(values)
      toast.success('Đã cập nhật sản phẩm.')
      setIsEditOpen(false)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật sản phẩm.'))
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

  async function handleArchive() {
    // Archive = update status; backend doesn't have explicit archive endpoint yet
    // Placeholder: navigate back after confirmation
    toast.info('Tính năng lưu trữ đang được phát triển.')
    setIsArchiveOpen(false)
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
        {canUpdate && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsArchiveOpen(true)}
            >
              <Archive className="size-4" aria-hidden="true" />
              Lưu trữ
            </Button>
            <Button type="button" size="sm" onClick={() => setIsEditOpen(true)}>
              <Pencil className="size-4" aria-hidden="true" />
              Chỉnh sửa
            </Button>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left sidebar */}
        <div className="lg:sticky lg:top-20">
          <ProductDetailSidebar product={product} />
        </div>

        {/* Right tabbed panel */}
        <Tabs defaultValue="info" className="min-w-0">
          <TabsList variant="line" className="h-10 w-full justify-start border-b p-0">
            <TabsTrigger value="info" className="h-10 flex-none px-3">
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger value="stock" className="h-10 flex-none px-3">
              <Settings2 className="size-4" aria-hidden="true" />
              Chính sách tồn kho
            </TabsTrigger>
            <TabsTrigger value="barcode" className="h-10 flex-none px-3">
              <QrCode className="size-4" aria-hidden="true" />
              Mã vạch
            </TabsTrigger>
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="mt-4">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Ngưỡng tồn kho tối thiểu
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {product.minStockThreshold != null ? product.minStockThreshold : '—'}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">đơn vị</p>
                </div>
                {canConfigureStockPolicy && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsStockPolicyOpen(true)}
                  >
                    <Settings2 className="size-4" aria-hidden="true" />
                    Cấu hình
                  </Button>
                )}
              </div>
            </div>
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
        </Tabs>
      </div>

      {canUpdate && isEditOpen && (
        <UpdateProductDialog
          open={isEditOpen}
          product={product}
          isPending={updateMutation.isPending}
          onOpenChange={setIsEditOpen}
          onSubmit={(values) => void handleUpdate(values)}
        />
      )}

      {canUpdate && isArchiveOpen && (
        <ProductArchiveDialog
          product={product}
          isPending={false}
          onOpenChange={setIsArchiveOpen}
          onConfirm={() => void handleArchive()}
        />
      )}

      {canConfigureStockPolicy && isStockPolicyOpen && (
        <ProductStockPolicyDialog
          open={isStockPolicyOpen}
          product={product}
          isPending={stockPolicyMutation.isPending}
          onOpenChange={setIsStockPolicyOpen}
          onSubmit={(values) => void handleStockPolicy(values)}
        />
      )}
    </div>
  )
}
