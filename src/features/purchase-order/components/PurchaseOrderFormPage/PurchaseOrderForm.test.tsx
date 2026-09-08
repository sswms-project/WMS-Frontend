import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFieldArray, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { PurchaseOrderFormValues } from '../../schemas/purchase-order.schema'
import { PurchaseOrderForm } from './PurchaseOrderForm'

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const EMPTY_LINE = { productId: '', quantity: 1, unitPrice: null }

function PurchaseOrderFormTestTree() {
  const form = useForm<PurchaseOrderFormValues>({
    defaultValues: {
      warehouseId: '',
      supplierId: '',
      expectedDate: '',
      lines: [EMPTY_LINE],
    },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })

  return (
    <TooltipProvider>
      <PurchaseOrderForm
        title="Tạo đơn mua hàng"
        description="Chọn kho, nhà cung cấp và các sản phẩm cần nhập."
        form={form}
        fields={fieldArray.fields}
        warehouseOptions={[]}
        supplierOptions={[]}
        productOptions={[]}
        isWarehouseSearchLoading={false}
        isSupplierSearchLoading={false}
        isProductSearchLoading={false}
        isPending={false}
        onAddLine={() => fieldArray.append(EMPTY_LINE)}
        onRemoveLine={fieldArray.remove}
        onCancel={vi.fn()}
        onSaveDraft={vi.fn()}
        onSaveAndSubmit={vi.fn()}
        onWarehouseSearchChange={vi.fn()}
        onSupplierSearchChange={vi.fn()}
        onProductSearchChange={vi.fn()}
      />
    </TooltipProvider>
  )
}

describe('PurchaseOrderForm', () => {
  it('preserves existing quantities when a product line is added', async () => {
    const user = userEvent.setup()
    render(<PurchaseOrderFormTestTree />)

    const firstQuantity = screen.getByRole('spinbutton', { name: 'Số lượng dòng 1' })
    expect(screen.getAllByRole('spinbutton', { name: 'Số lượng dòng 1' })).toHaveLength(1)

    await user.clear(firstQuantity)
    await user.type(firstQuantity, '12')
    await user.click(screen.getByRole('button', { name: 'Thêm dòng' }))

    expect(screen.getByRole('spinbutton', { name: 'Số lượng dòng 1' })).toHaveValue(12)
    expect(screen.getByRole('spinbutton', { name: 'Số lượng dòng 2' })).toHaveValue(1)
  })
})
