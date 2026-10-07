import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type { InboundRequestFormValues } from '../../schemas/inbound-request.schema'
import { InboundRequestForm } from './InboundRequestForm'

function EditForm({ onEditCode }: { readonly onEditCode?: () => void }) {
  const form = useForm<InboundRequestFormValues>({
    defaultValues: {
      inboundRequestCode: 'IR001',
      warehouseId: '',
      sourceType: 'Supplier',
      supplierId: '',
      sourceName: '',
      sourceReference: '',
      expectedDate: '',
      receivingAssignedTo: '',
      lines: [],
    },
  })
  return (
    <InboundRequestForm
      title="Chỉnh sửa IR001"
      autoApprove={false}
      form={form}
      fields={[]}
      warehouseOptions={[]}
      supplierOptions={[]}
      productOptions={[]}
      productsById={{}}
      conversionsByProductId={{}}
      units={[]}
      isUnitLoading={false}
      isUnitError={false}
      onRetryUnits={vi.fn()}
      isWarehouseSearchLoading={false}
      isSupplierSearchLoading={false}
      isProductSearchLoading={false}
      isPending={false}
      onAddLine={vi.fn()}
      onRemoveLine={vi.fn()}
      onCancel={vi.fn()}
      onSaveDraft={vi.fn()}
      onSaveAndSubmit={vi.fn()}
      onWarehouseSearchChange={vi.fn()}
      onSupplierSearchChange={vi.fn()}
      onProductSearchChange={vi.fn()}
      onEditCode={onEditCode}
    />
  )
}

describe('request code-only editing entry', () => {
  it('uses the code-only action and prevents switching with unsaved content', async () => {
    const user = userEvent.setup()
    const onEditCode = vi.fn()
    render(<EditForm onEditCode={onEditCode} />)
    await user.click(screen.getByRole('button', { name: 'Chỉ đổi mã' }))
    expect(onEditCode).toHaveBeenCalledOnce()
    await user.type(screen.getByLabelText('Mã chứng từ tham chiếu (tùy chọn)'), 'Changed')
    expect(screen.getByRole('button', { name: 'Chỉ đổi mã' })).toBeDisabled()
  })
  it('does not expose code-only editing without the capability callback', () => {
    render(<EditForm />)
    expect(screen.queryByRole('button', { name: 'Chỉ đổi mã' })).not.toBeInTheDocument()
  })
})
