import { Badge } from '@/components/ui/badge'
import type { SupplierStatus } from '../../types/supplier.types'
import { SUPPLIER_STATUS_LABELS } from '../../utils/supplier-format'

export function SupplierStatusBadge({ status }: { readonly status: SupplierStatus }) {
  return (
    <Badge variant={status === 'Inactive' ? 'outline' : 'default'}>
      {SUPPLIER_STATUS_LABELS[status]}
    </Badge>
  )
}
