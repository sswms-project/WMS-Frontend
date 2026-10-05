import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stockPolicySchema, type StockPolicyFormValues } from '../schemas/product.schema'
import { ProductStockPolicyDialog } from './ProductStockPolicyForm'

function PolicyHarness({ onSubmit }: { onSubmit: (values: StockPolicyFormValues) => void }) {
  const form = useForm<StockPolicyFormValues>({
    resolver: zodResolver(stockPolicySchema),
    defaultValues: {
      scope: 'single',
      warehouseId: 'warehouse-1',
      preferredSlotId: null,
      minStockThreshold: 0,
      maxStockThreshold: null,
      reorderPoint: null,
      safetyStock: 0,
      leadTimeDays: null,
    },
  })
  return (
    <ProductStockPolicyDialog
      form={form}
      open
      warehouses={[
        {
          id: 'warehouse-1',
          warehouseCode: 'WH1',
          warehouseName: 'Kho QA',
          address: null,
          status: 'Active',
          createdAt: '2026-10-05T00:00:00Z',
        },
      ]}
      policies={[]}
      locations={[]}
      areLocationsLoading={false}
      isPending={false}
      onWarehouseChange={() => {}}
      onOpenChange={() => {}}
      onSubmit={onSubmit}
    />
  )
}

afterEach(cleanup)

describe('stock policy optional numeric fields', () => {
  it('saves on the first click with untouched optional fields remaining null', async () => {
    const onSubmit = vi.fn<(values: StockPolicyFormValues) => void>()
    const user = userEvent.setup()
    render(<PolicyHarness onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Ngưỡng tối thiểu'), '100')
    await user.type(screen.getByLabelText(/Ngưỡng tối đa/), '300')
    await user.click(screen.getByRole('button', { name: /^Lưu$/ }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      minStockThreshold: 100,
      maxStockThreshold: 300,
      leadTimeDays: null,
      reorderPoint: null,
    })
    expect(screen.queryByText('Thời gian cung ứng phải lớn hơn 0')).not.toBeInTheDocument()
  })

  it('preserves blank maximum, reorder point and a cleared lead time as null', async () => {
    const onSubmit = vi.fn<(values: StockPolicyFormValues) => void>()
    const user = userEvent.setup()
    render(<PolicyHarness onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Ngưỡng tối thiểu'), '10')
    const leadTime = screen.getByLabelText(/Thời gian cung ứng/)
    await user.type(leadTime, '7')
    await user.clear(leadTime)
    await user.click(screen.getByRole('button', { name: /^Lưu$/ }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      maxStockThreshold: null,
      reorderPoint: null,
      leadTimeDays: null,
    })
  })

  it('saves an explicitly entered positive whole-number lead time', async () => {
    const onSubmit = vi.fn<(values: StockPolicyFormValues) => void>()
    const user = userEvent.setup()
    render(<PolicyHarness onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/Thời gian cung ứng/), '7')
    await user.click(screen.getByRole('button', { name: /^Lưu$/ }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0]?.[0].leadTimeDays).toBe(7)
  })

  it.each(['0', '-1', '1.5'])(
    'still rejects an explicitly entered invalid lead time %s',
    async (value) => {
      const onSubmit = vi.fn()
      const user = userEvent.setup()
      render(<PolicyHarness onSubmit={onSubmit} />)
      await user.type(screen.getByLabelText(/Thời gian cung ứng/), value)
      await user.click(screen.getByRole('button', { name: /^Lưu$/ }))
      await waitFor(() =>
        expect(
          screen.getByLabelText(/Thời gian cung ứng/).closest('[data-slot="field"]')
        ).toHaveAttribute('data-invalid', 'true')
      )
      expect(onSubmit).not.toHaveBeenCalled()
    }
  )
})
