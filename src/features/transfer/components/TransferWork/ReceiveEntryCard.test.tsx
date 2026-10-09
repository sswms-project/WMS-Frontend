import { cleanup, render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TransferReceiptFormValues } from '../../schemas/transfer-fulfillment.schema'
import { ReceiveEntryCard } from './ReceiveEntryCard'

afterEach(cleanup)

function Harness({
  suggestedSlotLabel,
  slotLabel,
  destinationSlotId = '',
}: {
  suggestedSlotLabel?: string
  slotLabel?: string
  destinationSlotId?: string
}) {
  const form = useForm<TransferReceiptFormValues>({
    defaultValues: {
      entries: [
        {
          lineId: 'l1',
          lotId: null,
          productLabel: 'SKU-1',
          destinationSlotId,
          scannedSlotCode: 'A07',
          scannedProductCode: '',
          goodQuantity: 20,
          damagedQuantity: 0,
          missingQuantity: 0,
          reasonCode: '',
          note: '',
        },
      ],
    },
  })
  return (
    <ReceiveEntryCard
      index={0}
      form={form}
      heading="SKU-1 · Bia"
      lotLabel="Không theo lô"
      dispatchedQuantity={20}
      baseUnitName="Thùng"
      canRemove={false}
      slotLabel={slotLabel}
      suggestedSlotLabel={suggestedSlotLabel}
      disabled={false}
      isFindingSlot={false}
      onScanSlot={vi.fn()}
      onScanProduct={vi.fn()}
      onSplit={vi.fn()}
      onRemove={vi.fn()}
    />
  )
}

describe('ReceiveEntryCard', () => {
  it('shows where the requester suggested putting the goods away', () => {
    render(<Harness suggestedSlotLabel="Khu K01 / Kệ A07" />)
    expect(screen.getByText('Gợi ý cất tại')).toBeInTheDocument()
    expect(screen.getByText('Khu K01 / Kệ A07')).toBeInTheDocument()
  })

  it('shows no hint when nothing was suggested', () => {
    render(<Harness />)
    expect(screen.queryByText('Gợi ý cất tại')).not.toBeInTheDocument()
  })

  it('shows the full location once the slot has been scanned', () => {
    render(<Harness destinationSlotId="slot-1" slotLabel="Khu K01 / Kệ A07" />)
    expect(screen.getByText('Khu K01 / Kệ A07')).toBeInTheDocument()
  })
})
