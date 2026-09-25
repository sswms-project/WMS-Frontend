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
import type { ProductListItem } from '../../types/product.types'

const quantityFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 })

interface ProductListTableProps {
  readonly products: readonly ProductListItem[]
  readonly canEdit: boolean
  readonly onView: (product: ProductListItem) => void
  readonly onEdit: (product: ProductListItem) => void
}

export function ProductListTable({ products, canEdit, onView, onEdit }: ProductListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="bg-card sticky top-0 z-10 w-[200px] pl-4">Mã hàng hóa</TableHead>
          <TableHead className="bg-card sticky top-0 z-10">Tên sản phẩm</TableHead>
          <TableHead className="bg-card sticky top-0 z-10">Danh mục</TableHead>
          <TableHead className="bg-card sticky top-0 z-10">Đơn vị</TableHead>
          <TableHead className="bg-card sticky top-0 z-10 text-right">Tồn thực tế</TableHead>
          <TableHead className="bg-card sticky top-0 z-10 text-right">Đang giữ</TableHead>
          <TableHead className="bg-card sticky top-0 z-10 text-right">Khả dụng</TableHead>
          <TableHead className="bg-card sticky top-0 z-10 w-[120px] text-center">
            Trạng thái
          </TableHead>
          <TableHead className="bg-card sticky top-0 z-10 w-[100px] pr-4 text-right">
            Thao tác
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className="hover:bg-muted/30">
            <TableCell className="text-muted-foreground pl-4 font-mono text-xs">
              {product.sku}
            </TableCell>
            <TableCell className="font-medium">{product.productName}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              <span title={product.categoryPath ?? undefined}>{product.categoryName ?? '—'}</span>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{product.unitName}</TableCell>
            <TableCell className="text-right tabular-nums">
              {quantityFormatter.format(product.quantityOnHand)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {quantityFormatter.format(product.reservedQuantity)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {quantityFormatter.format(product.availableQuantity)}
            </TableCell>
            <TableCell className="text-center">
              <ProductStatusBadge status={product.status} />
            </TableCell>
            <TableCell className="pr-4 text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Xem chi tiết"
                  onClick={() => onView(product)}
                >
                  <Eye className="size-4" aria-hidden="true" />
                </Button>
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Chỉnh sửa"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
