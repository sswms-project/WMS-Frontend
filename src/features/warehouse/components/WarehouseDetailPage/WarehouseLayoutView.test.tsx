import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WarehouseLayoutView } from './WarehouseLayoutView'

describe('WarehouseLayoutView', () => {
  it('renders the read-only zone, rack, and slot hierarchy', () => {
    render(
      <WarehouseLayoutView
        zones={[
          {
            id: 'zone-1',
            zoneCode: 'A',
            zoneName: 'Khu A',
            description: null,
            status: 'Active',
            racks: [
              {
                id: 'rack-1',
                rackCode: 'A-01',
                rackName: 'Kệ A-01',
                status: 'Active',
                slots: [
                  {
                    id: 'slot-1',
                    slotCode: 'A-01-01',
                    status: 'Available',
                    capacity: 100,
                    currentOccupancy: 20,
                    barcodeValue: 'A-01-01',
                  },
                ],
              },
            ],
          },
        ]}
      />
    )

    expect(screen.getByText('Khu A')).toBeInTheDocument()
    expect(screen.getByText('Kệ A-01')).toBeInTheDocument()
    expect(screen.getByText('A-01-01')).toBeInTheDocument()
  })
})
