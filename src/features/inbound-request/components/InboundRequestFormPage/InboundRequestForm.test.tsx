import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFieldArray, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { InboundRequestFormValues } from '../../schemas/inbound-request.schema'
import { InboundRequestForm } from './InboundRequestForm'

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const EMPTY_LINE = { productId: '', quantity: 1, unitPrice: null }

function InboundRequestFormTestTree() {
  const form = useForm<InboundRequestFormValues>({
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
      <InboundRequestForm
        title="Tạo yêu cầu nhập kho"
        description="Chọn kho, nhà cung cấp và các sản phẩm cần nhập."
        currency="VND"
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

describe('InboundRequestForm', () => {
  it('preserves existing quantities when a product line is added', async () => {
    const user = userEvent.setup()
    render(<InboundRequestFormTestTree />)

    const firstQuantity = screen.getByRole('spinbutton', { name: 'Số lượng dòng 1' })
    expect(screen.getAllByRole('spinbutton', { name: 'Số lượng dòng 1' })).toHaveLength(1)

    await user.clear(firstQuantity)
    await user.type(firstQuantity, '12')
    await user.click(screen.getByRole('button', { name: 'Thêm dòng' }))

    expect(screen.getByRole('spinbutton', { name: 'Số lượng dòng 1' })).toHaveValue(12)
    expect(screen.getByRole('spinbutton', { name: 'Số lượng dòng 2' })).toHaveValue(1)
  })
})
