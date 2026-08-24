'use client'

import { useState } from 'react'
import { Package, PackagePlus, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  ProductListTable,
  ProductListToolbar,
  ProductListPagination,
} from '../components/ProductListPage'
import { CreateProductDialog } from '../components/ProductForm'
import { ProductImportDialog } from '../components/ProductImportDialog'
import {
  useCreateProductMutation,
  useImportProductsMutation,
  useProductListQuery,
} from '../hooks/use-products'
import type { CreateProductFormValues } from '../schemas/product.schema'
import { productService } from '../services/product.service'
import type { ProductResponse } from '../types/product.types'

const PAGE_SIZE = 10

export function ProductListPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(searchText.trim(), 300)

  const listQuery = useProductListQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch ? { searchTerm: debouncedSearch } : {}),
  })

  const createMutation = useCreateProductMutation()
  const importMutation = useImportProductsMutation()

  const products = listQuery.data?.items ?? []

  function handleSearchChange(value: string) {
    setSearchText(value)
    setPage(1)
  }

  async function handleCreate(values: CreateProductFormValues) {
    try {
      const { minStockThreshold, ...createRequest } = values
      const id = await createMutation.mutateAsync(createRequest)
      if (minStockThreshold != null && !isNaN(minStockThreshold)) {
        await productService.configureStockPolicy(id, { minStockThreshold })
      }
      toast.success('Đã thêm sản phẩm mới.')
      setIsCreateOpen(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(APP_ROUTES.productDetail(id) as any)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể thêm sản phẩm. Vui lòng thử lại.'))
    }
  }

  async function handleImport(file: File) {
    void file
    // Parse xlsx client-side is complex; send as JSON after parse or as form-data
    // For now we call the API with an empty items list and let the server handle the file
    // A full implementation would use a library like xlsx to parse the file
    toast.info('Tính năng nhập Excel đang được phát triển.')
    setIsImportOpen(false)
  }

  function handleView(product: ProductResponse) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(APP_ROUTES.productDetail(product.id) as any)
  }

  function handleEdit(product: ProductResponse) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(APP_ROUTES.productDetail(product.id) as any)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-4">
      <header className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Kho hàng</p>
            <h1 className="mt-0.5 text-xl font-semibold">Danh mục sản phẩm</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
              Quản lý toàn bộ sản phẩm, đơn vị tính và chính sách tồn kho.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="size-4" aria-hidden="true" />
            Nhập Excel
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={() => setIsCreateOpen(true)}>
            <PackagePlus className="size-4" aria-hidden="true" />
            Thêm sản phẩm
          </Button>
        </div>
      </header>

      <section className="bg-card min-w-0 overflow-hidden border" aria-label="Danh sách sản phẩm">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b px-3 py-3 sm:px-4">
          <div>
            <h2 className="text-sm font-semibold">Tất cả sản phẩm</h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {listQuery.data?.totalCount ?? 0} sản phẩm
            </p>
          </div>
        </div>

        <ProductListToolbar
          searchText={searchText}
          isFetching={listQuery.isFetching}
          onSearchChange={handleSearchChange}
        />

        {listQuery.isLoading && (
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex h-14 items-center gap-3 px-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="ml-auto h-4 w-20" />
              </div>
            ))}
          </div>
        )}

        {listQuery.isError && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <Package className="text-destructive size-10" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Không thể tải danh sách sản phẩm</p>
              <p className="text-muted-foreground mt-1 text-xs">Vui lòng thử lại.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={listQuery.isFetching}
              onClick={() => void listQuery.refetch()}
            >
              Thử lại
            </Button>
          </div>
        )}

        {!listQuery.isLoading && !listQuery.isError && products.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="bg-muted flex size-12 items-center justify-center">
              <Package className="text-muted-foreground size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Không tìm thấy sản phẩm</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {debouncedSearch ? 'Thử tên hoặc SKU khác.' : 'Chưa có sản phẩm nào.'}
              </p>
            </div>
            {searchText && (
              <Button type="button" variant="outline" onClick={() => handleSearchChange('')}>
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        )}

        {products.length > 0 && (
          <>
            <ProductListTable products={products} onView={handleView} onEdit={handleEdit} />
            <ProductListPagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={listQuery.data?.totalCount ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <CreateProductDialog
        open={isCreateOpen}
        isPending={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => void handleCreate(values)}
      />

      <ProductImportDialog
        open={isImportOpen}
        isPending={importMutation.isPending}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
      />
    </div>
  )
}
