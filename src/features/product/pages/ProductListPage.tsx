'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Package, PackagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { UnsavedChangesDialog } from '@/components/operations/UnsavedChangesDialog'
import { P } from '@/config/permissionCodes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { APP_ROUTES } from '@/routes/app-routes'
import { ProductListTable, ProductListToolbar } from '../components/ProductListPage'
import { CreateProductDialog } from '../components/ProductForm'
import {
  useCreateProductMutation,
  useCreateCategoryMutation,
  useCategoriesQuery,
  useProductListQuery,
  useUnitsQuery,
} from '../hooks/use-products'
import { createProductSchema, type CreateProductFormValues } from '../schemas/product.schema'
import { categorySchema, type CategoryFormValues } from '../schemas/master-data.schema'
import type { ProductListItem, ProductStatus } from '../types/product.types'

function parseProductStatus(value: string): ProductStatus | '' {
  return value === 'Active' || value === 'Inactive' ? value : ''
}

function parseTrackingMode(value: string): 'quantity' | 'lot' | '' {
  return value === 'quantity' || value === 'lot' ? value : ''
}

export default function ProductListPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchText, setSearchText] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [status, setStatus] = useState<ProductStatus | ''>('')
  const [trackingMode, setTrackingMode] = useState<'quantity' | 'lot' | ''>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [discardTarget, setDiscardTarget] = useState<'product' | 'category' | null>(null)
  const debouncedSearch = useDebouncedValue(searchText.trim(), 300)
  const productForm = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: '',
      productName: '',
      description: null,
      unitId: '',
      categoryId: '',
      isLotTracked: false,
      shelfLifeDays: null,
      unitConversions: [],
    },
  })
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryCode: '',
      categoryName: '',
      parentCategoryId: null,
      description: '',
    },
  })

  const meQuery = useMeQuery()
  const permissions = new Set(meQuery.data?.permissions ?? [])
  const warehousesQuery = useWarehousesQuery(
    { top: 100, skip: 0, needTotalCount: true },
    permissions.has(P.WAREHOUSES_VIEW)
  )
  const listQuery = useProductListQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearch ? { searchTerm: debouncedSearch } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(status ? { status } : {}),
    ...(trackingMode ? { isLotTracked: trackingMode === 'lot' } : {}),
  })

  const createMutation = useCreateProductMutation()
  const createCategoryMutation = useCreateCategoryMutation()
  const unitsQuery = useUnitsQuery(isCreateOpen, 'Active')
  const categoriesQuery = useCategoriesQuery(true, 'Active')

  const products = listQuery.data?.items ?? []
  const canCreate = permissions.has(P.PRODUCTS_CREATE)
  const canEdit = permissions.has(P.PRODUCTS_UPDATE)
  const canManageUnits = permissions.has(P.UNITS_MANAGE)
  const canManageCategories = permissions.has(P.CATEGORIES_MANAGE)

  function handleSearchChange(value: string) {
    setSearchText(value)
    setPage(1)
  }

  async function handleCreate(values: CreateProductFormValues, createAnother: boolean) {
    try {
      const id = await createMutation.mutateAsync(values)
      toast.success('Đã thêm sản phẩm mới.')
      if (!createAnother) {
        productForm.reset()
        setIsCreateOpen(false)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push(APP_ROUTES.productDetail(id) as any)
      }
      return true
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể thêm sản phẩm. Vui lòng thử lại.'))
      return false
    }
  }

  function handleCreateOpenChange(open: boolean) {
    if (!open && productForm.formState.isDirty) {
      setDiscardTarget('product')
      return
    }
    if (!open) productForm.reset()
    setIsCreateOpen(open)
  }

  function handleCategoryDialogOpenChange(open: boolean) {
    if (!open && categoryForm.formState.isDirty) {
      setDiscardTarget('category')
      return
    }
    if (open) {
      categoryForm.reset({
        categoryCode: '',
        categoryName: '',
        parentCategoryId: null,
        description: '',
      })
    }
    setIsCategoryDialogOpen(open)
  }

  async function handleCreateCategory(values: CategoryFormValues) {
    try {
      const categoryId = await createCategoryMutation.mutateAsync({
        ...values,
        description: values.description || null,
      })
      toast.success('Đã tạo và chọn nhóm vật tư hàng hóa.')
      return categoryId
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tạo nhóm vật tư hàng hóa.'))
      return null
    }
  }

  function handleView(product: ProductListItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(APP_ROUTES.productDetail(product.id) as any)
  }

  function handleEdit(product: ProductListItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`${APP_ROUTES.productDetail(product.id)}?edit=1` as any)
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <header className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Kho hàng</p>
            <h1 className="mt-0.5 text-xl font-semibold">Danh mục vật tư hàng hóa</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
              Quản lý toàn bộ sản phẩm, đơn vị tính và chính sách tồn kho.
            </p>
          </div>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => handleCreateOpenChange(true)}
              >
                <PackagePlus className="size-4" aria-hidden="true" />
                Thêm sản phẩm
              </Button>
            )}
          </div>
        )}
      </header>

      <section
        className="bg-card flex min-h-0 min-w-0 flex-col overflow-hidden border [&>[data-slot=table-container]]:max-h-[calc(100vh-300px)] [&>[data-slot=table-container]]:overflow-y-auto"
        aria-label="Danh sách sản phẩm"
      >
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
          categoryId={categoryId}
          warehouseId={warehouseId}
          status={status}
          trackingMode={trackingMode}
          categories={categoriesQuery.data ?? []}
          warehouses={(warehousesQuery.data?.items ?? []).filter(
            (warehouse) => warehouse.status === 'Active'
          )}
          isFetching={listQuery.isFetching}
          onSearchChange={handleSearchChange}
          onCategoryChange={(value) => {
            setCategoryId(value)
            setPage(1)
          }}
          onWarehouseChange={(value) => {
            setWarehouseId(value)
            setPage(1)
          }}
          onStatusChange={(value) => {
            setStatus(parseProductStatus(value))
            setPage(1)
          }}
          onTrackingModeChange={(value) => {
            setTrackingMode(parseTrackingMode(value))
            setPage(1)
          }}
          onRefresh={() => void listQuery.refetch()}
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
            <ProductListTable
              products={products}
              canEdit={canEdit}
              onView={handleView}
              onEdit={handleEdit}
            />
            <OperationalPagination
              page={page}
              pageSize={pageSize}
              totalCount={listQuery.data?.totalCount ?? 0}
              isPending={listQuery.isFetching}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value)
                setPage(1)
              }}
            />
          </>
        )}
      </section>

      {canCreate && (
        <CreateProductDialog
          form={productForm}
          categoryForm={categoryForm}
          isCategoryDialogOpen={isCategoryDialogOpen}
          units={unitsQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          areOptionsLoading={unitsQuery.isLoading || categoriesQuery.isLoading}
          areOptionsError={unitsQuery.isError || categoriesQuery.isError}
          onRetryOptions={() => {
            void unitsQuery.refetch()
            void categoriesQuery.refetch()
          }}
          canManageUnits={canManageUnits}
          canManageCategories={canManageCategories}
          isCreatingCategory={createCategoryMutation.isPending}
          onCreateCategory={handleCreateCategory}
          open={isCreateOpen}
          isPending={createMutation.isPending}
          onOpenChange={handleCreateOpenChange}
          onCategoryDialogOpenChange={handleCategoryDialogOpenChange}
          onSubmit={handleCreate}
        />
      )}
      <UnsavedChangesDialog
        open={discardTarget !== null}
        onOpenChange={(open) => !open && setDiscardTarget(null)}
        onDiscard={() => {
          if (discardTarget === 'product') {
            productForm.reset()
            setIsCreateOpen(false)
          } else if (discardTarget === 'category') {
            categoryForm.reset()
            setIsCategoryDialogOpen(false)
          }
          setDiscardTarget(null)
        }}
      />
    </div>
  )
}
