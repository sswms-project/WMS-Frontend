import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PutawayForm } from '../components/PutawayDetailPage'
import type { PutawayRequest } from '../types/inbound.types'
import InboundPutawayDetailPage from './InboundPutawayDetailPage'

const fixtures = vi.hoisted(() => {
  const itemId = '10000000-0000-4000-8000-000000000001'
  const slotId = '10000000-0000-4000-8000-000000000002'
  const baseId = '10000000-0000-4000-8000-000000000003'
  const cartonId = '10000000-0000-4000-8000-000000000004'
  return {
    itemId,
    slotId,
    cartonId,
    receipt: {
      version: 'v1',
      warehouseId: 'warehouse',
      putAwayTaskExecutionStatus: 'InProgress',
      items: [
        {
          id: itemId,
          inboundRequestItemId: 'request-item',
          productId: 'product',
          baseUnitId: baseId,
          enteredUnitId: cartonId,
          baseUnitName: 'Lon',
          remainingPutAwayQuantity: 240,
          putAwayPlan: [] as { slotId: string; quantity: number }[],
          allowedUnits: [
            { unitId: baseId, conversionFactor: 1, quantityPrecision: 0 },
            { unitId: cartonId, conversionFactor: 24, quantityPrecision: 0 },
          ],
        },
      ],
    },
    mutate: vi.fn(),
    upload: vi.fn(),
    refetch: vi.fn(),
    push: vi.fn(),
  }
})
let renderedForm: ComponentProps<typeof PutawayForm>
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: fixtures.push }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }))
vi.mock('@/features/auth/hooks/use-auth', () => ({
  useMeQuery: () => ({ data: { permissions: [] } }),
}))
vi.mock('@/features/inventory/hooks/use-inventory', () => ({
  useUploadInventoryEvidenceMutation: () => ({ mutateAsync: fixtures.upload, isPending: false }),
}))
vi.mock('@/features/warehouse/hooks/use-warehouse', () => ({
  useWarehouseLayoutQuery: () => ({ data: [], refetch: vi.fn() }),
}))
vi.mock('../utils/putaway-slot-options', () => ({
  getPutawaySlotOptions: () => [{ id: fixtures.slotId, code: 'A01' }],
}))
vi.mock('../hooks/use-putaway-form-suggestions', () => ({
  usePutawayFormSuggestions: () => ({
    suggestions: null,
    isSuggesting: false,
    onSuggest: vi.fn(),
    onApply: vi.fn(),
    onApplyBest: vi.fn(),
    onClear: vi.fn(),
  }),
}))
vi.mock('../hooks/use-putaway-plan-editor', () => ({
  usePutawayPlanEditor: () => ({ isOpen: false, open: vi.fn() }),
}))
vi.mock('../components/ReceiptDetailPage', () => ({ PutawayPlanSheet: () => null }))
vi.mock('../hooks/use-inbound', () => ({
  useGoodsReceiptQuery: () => ({ data: fixtures.receipt, refetch: fixtures.refetch }),
  useInboundAllowedActionsQuery: () => ({ data: { allowedActions: [] } }),
  usePutawayMutation: () => ({ mutateAsync: fixtures.mutate, isPending: false }),
  useCancelPutawayTaskMutation: () => ({ isPending: false }),
  useReconcilePutawayCancellationMutation: () => ({ isPending: false }),
}))
vi.mock('../components/PutawayDetailPage', () => ({
  CancelPutawayDialog: () => null,
  PutawayForm: (props: ComponentProps<typeof PutawayForm>) => {
    renderedForm = props
    return <button onClick={props.onSubmit}>Submit</button>
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  fixtures.receipt.version = 'v1'
  fixtures.receipt.items[0]!.remainingPutAwayQuantity = 240
  fixtures.receipt.items[0]!.putAwayPlan = []
  fixtures.refetch.mockResolvedValue(undefined)
})
afterEach(cleanup)

function prepareAllocation() {
  act(() => {
    renderedForm.form.setValue('lines.0.slotId', fixtures.slotId, { shouldDirty: true })
    renderedForm.form.setValue('lines.0.enteredQuantity', 4, { shouldDirty: true })
  })
}

describe('put-away command retry safety', () => {
  it('replays the immutable command after a committed response is lost, even when refreshed stock cannot fit it', async () => {
    const user = userEvent.setup()
    const commands = new Set<string>()
    let posted = 0
    fixtures.mutate.mockImplementation(async ({ request }: { request: PutawayRequest }) => {
      if (!commands.has(request.commandId)) {
        commands.add(request.commandId)
        posted += request.lines[0]!.enteredQuantity * 24
        throw { statusCode: 500, message: 'Response lost after commit' }
      }
    })
    fixtures.refetch.mockImplementation(async () => {
      fixtures.receipt.version = 'v2'
      fixtures.receipt.items[0]!.remainingPutAwayQuantity = 0
    })
    const view = render(<InboundPutawayDetailPage receiptId="receipt" />)
    prepareAllocation()
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(renderedForm.hasUncertainSubmission).toBe(true))
    const unload = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unload)
    expect(unload.defaultPrevented).toBe(true)
    const original = structuredClone(fixtures.mutate.mock.calls[0]![0].request)
    view.rerender(<InboundPutawayDetailPage receiptId="other-receipt" />)
    act(() => renderedForm.form.setValue('lines.0.enteredQuantity', 1))
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(fixtures.push).toHaveBeenCalledOnce())
    expect(fixtures.mutate.mock.calls[1]![0].request).toEqual(original)
    expect(fixtures.mutate.mock.calls[1]![0].receiptId).toBe('receipt')
    expect(original.expectedVersion).toBe('v1')
    expect(posted).toBe(96)
    expect(commands.size).toBe(1)
    const resolvedUnload = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(resolvedUnload)
    expect(resolvedUnload.defaultPrevented).toBe(false)
  })

  it('guards rapid duplicate submits while the first network request is still pending', async () => {
    let complete: (() => void) | undefined
    fixtures.mutate.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve
        })
    )
    render(<InboundPutawayDetailPage receiptId="receipt" />)
    prepareAllocation()
    act(() => {
      renderedForm.onSubmit()
      renderedForm.onSubmit()
    })
    await waitFor(() => expect(fixtures.mutate).toHaveBeenCalledOnce())
    await act(async () => complete?.())
    expect(fixtures.push).toHaveBeenCalledOnce()
  })

  it.each([400, 409])(
    'allows a corrected new command after a definitive initial %s rejection',
    async (statusCode) => {
      const user = userEvent.setup()
      fixtures.mutate
        .mockRejectedValueOnce({ statusCode, message: 'Rejected' })
        .mockResolvedValueOnce(undefined)
      render(<InboundPutawayDetailPage receiptId="receipt" />)
      prepareAllocation()
      await user.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => expect(fixtures.refetch).toHaveBeenCalled())
      expect(renderedForm.hasUncertainSubmission).toBe(false)
      act(() => renderedForm.form.setValue('lines.0.enteredQuantity', 2))
      await user.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => expect(fixtures.mutate).toHaveBeenCalledTimes(2))
      expect(fixtures.mutate.mock.calls[1]![0].request.commandId).not.toBe(
        fixtures.mutate.mock.calls[0]![0].request.commandId
      )
      expect(fixtures.mutate.mock.calls[1]![0].request.lines[0].enteredQuantity).toBe(2)
    }
  )

  it('does not unlock an uncertain command when its retry conflicts', async () => {
    const user = userEvent.setup()
    fixtures.mutate
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValue({ statusCode: 409, message: 'Version changed' })
    render(<InboundPutawayDetailPage receiptId="receipt" />)
    prepareAllocation()
    for (let attempt = 1; attempt <= 3; attempt++) {
      await user.click(screen.getByRole('button', { name: 'Submit' }))
      await waitFor(() => expect(fixtures.mutate).toHaveBeenCalledTimes(attempt))
    }
    expect(renderedForm.hasUncertainSubmission).toBe(true)
    for (const [call] of fixtures.mutate.mock.calls)
      expect(call.request).toEqual(fixtures.mutate.mock.calls[0]![0].request)
  })
})

describe('put-away against the manager plan', () => {
  const otherSlotId = '10000000-0000-4000-8000-000000000099'

  it('sends the reason and uploaded photos when the slot differs from the plan', async () => {
    const user = userEvent.setup()
    fixtures.receipt.items[0]!.putAwayPlan = [{ slotId: otherSlotId, quantity: 240 }]
    fixtures.upload.mockResolvedValue({ data: { id: 'evidence-1', fileName: 'ke-day.png' } })
    render(<InboundPutawayDetailPage receiptId="receipt" />)
    prepareAllocation()
    act(() => renderedForm.form.setValue('overrideReason', '  Kệ trong kế hoạch đã đầy '))
    await act(async () =>
      renderedForm.evidence.onAdd(new File(['x'], 'ke-day.png', { type: 'image/png' }))
    )
    await waitFor(() => expect(renderedForm.evidence.items).toHaveLength(1))
    expect(renderedForm.planDeviation.requiresReason).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(fixtures.mutate).toHaveBeenCalledOnce())
    expect(fixtures.mutate.mock.calls[0]![0].request).toMatchObject({
      overrideReason: 'Kệ trong kế hoạch đã đầy',
      evidenceIds: ['evidence-1'],
    })
  })

  it('does not submit a deviating put-away without a reason', async () => {
    const user = userEvent.setup()
    fixtures.receipt.items[0]!.putAwayPlan = [{ slotId: otherSlotId, quantity: 240 }]
    render(<InboundPutawayDetailPage receiptId="receipt" />)
    prepareAllocation()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(fixtures.mutate).not.toHaveBeenCalled()
  })

  it('does not require or send a reason when the put-away follows the plan', async () => {
    const user = userEvent.setup()
    fixtures.receipt.items[0]!.putAwayPlan = [{ slotId: fixtures.slotId, quantity: 240 }]
    render(<InboundPutawayDetailPage receiptId="receipt" />)
    prepareAllocation()
    expect(renderedForm.planDeviation.requiresReason).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(fixtures.mutate).toHaveBeenCalledOnce())
    expect(fixtures.mutate.mock.calls[0]![0].request).not.toHaveProperty('overrideReason')
    expect(fixtures.mutate.mock.calls[0]![0].request).not.toHaveProperty('evidenceIds')
  })
})
