import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductStatusBadge } from '../ProductStatusBadge'
import type { ProductResponse } from '../../types/product.types'

interface ProductListTableProps {
  readonly products: readonly ProductResponse[]
  readonly onView: (product: ProductResponse) => void
  readonly onEdit: (product: ProductResponse) => void
}

export function ProductListTable({ products, onView, onEdit }: ProductListTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[200px] pl-4">Mã SKU</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
            <TableHead className="w-[100px] pr-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="hover:bg-muted/30 cursor-pointer"
              onClick={() => onView(product)}
            >
              <TableCell className="text-muted-foreground pl-4 font-mono text-xs">
                {product.sku}
              </TableCell>
              <TableCell className="font-medium">{product.productName}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {product.categoryName ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{product.unitName}</TableCell>
              <TableCell className="text-center">
                <ProductStatusBadge status={product.status} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div
                  className="flex items-center justify-end gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Xem chi tiết"
                    onClick={() => onView(product)}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Chỉnh sửa"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
