'use client'

import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import type { ProductStockStatus, ProductStockStatusCounts } from '../../types/product.types'

interface ProductStockStatusFilterProps {
  readonly value: ProductStockStatus | ''
  readonly counts: ProductStockStatusCounts
  readonly onValueChange: (value: ProductStockStatus | '') => void
}

const itemClassName =
  'text-muted-foreground hover:bg-surface-container-high hover:text-foreground h-8 gap-2 rounded-md px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm data-[state=on]:hover:bg-primary/90'
const badgeClassName = 'rounded-full px-1.5 tabular-nums'
const activeBadgeClassName = 'bg-primary-foreground/15 text-primary-foreground'

export function ProductStockStatusFilter({
  value,
  counts,
  onValueChange,
}: ProductStockStatusFilterProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <ToggleGroup
        type="single"
        value={value || 'all'}
        onValueChange={(nextValue) => {
          if (!nextValue) return
          onValueChange(nextValue === 'LowStock' || nextValue === 'OutOfStock' ? nextValue : '')
        }}
        spacing={1}
        aria-label="Lọc theo tình trạng tồn kho"
        className="bg-muted/80 rounded-lg p-1"
      >
        <ToggleGroupItem
          value="all"
          aria-label={`Tất cả ${counts.all} sản phẩm`}
          className={itemClassName}
        >
          Tất cả
          <Badge variant="secondary" className={cn(badgeClassName, !value && activeBadgeClassName)}>
            {counts.all}
          </Badge>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="LowStock"
          aria-label={`Sắp hết hàng ${counts.lowStock} sản phẩm`}
          className={itemClassName}
        >
          Sắp hết hàng
          <Badge
            variant="secondary"
            className={cn(
              badgeClassName,
              value === 'LowStock'
                ? activeBadgeClassName
                : 'bg-warning-container text-on-warning-container'
            )}
          >
            {counts.lowStock}
          </Badge>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="OutOfStock"
          aria-label={`Hết hàng ${counts.outOfStock} sản phẩm`}
          className={itemClassName}
        >
          Hết hàng
          <Badge
            variant="secondary"
            className={cn(
              badgeClassName,
              value === 'OutOfStock' ? activeBadgeClassName : 'bg-destructive/10 text-destructive'
            )}
          >
            {counts.outOfStock}
          </Badge>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
