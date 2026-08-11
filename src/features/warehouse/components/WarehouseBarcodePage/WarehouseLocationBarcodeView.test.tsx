import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WarehouseLocationBarcodeView } from './WarehouseLocationBarcodeView'

const jsBarcode = vi.hoisted(() => vi.fn())

vi.mock('jsbarcode', () => ({ default: jsBarcode }))

describe('WarehouseLocationBarcodeView', () => {
  beforeEach(() => {
    jsBarcode.mockReset()
    Object.defineProperty(window, 'print', { configurable: true, value: vi.fn() })
  })

  it('renders Code 128 metadata and prints a single-label page', async () => {
    const user = userEvent.setup()
    render(
      <WarehouseLocationBarcodeView
        warehouseId="warehouse-1"
        barcode={{
          locationId: 'rack-1',
          locationType: 'Rack',
          locationCode: 'R-01',
          barcodeValue: 'R-01',
          symbology: 'Code128',
        }}
      />
    )

    expect(jsBarcode).toHaveBeenCalledWith(
      expect.any(SVGSVGElement),
      'R-01',
      expect.objectContaining({ format: 'CODE128' })
    )
    expect(screen.getByRole('img', { name: 'Barcode R-01' })).toBeInTheDocument()
    expect(screen.getByText('Code128')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'In nhãn' }))
    expect(window.print).toHaveBeenCalledOnce()
  })
})
