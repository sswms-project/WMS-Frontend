import { describe, expect, it } from 'vitest'
import { getNextDeliveryStatuses, isDeliveryFinished } from './delivery-format'

describe('delivery transition graph', () => {
  it('matches the backend transition contract', () => {
    expect(getNextDeliveryStatuses('ReadyToShip')).toEqual(['AssignedToTransport'])
    expect(getNextDeliveryStatuses('AssignedToTransport')).toEqual(['Shipping', 'Failed'])
    expect(getNextDeliveryStatuses('Shipping')).toEqual(['Delivered', 'Failed'])
    expect(getNextDeliveryStatuses('Failed')).toEqual(['AssignedToTransport'])
  })

  it.each(['Pending', 'Picking', 'Packing', 'Delivered'] as const)(
    'does not expose an update from %s',
    (status) => expect(getNextDeliveryStatuses(status)).toEqual([])
  )

  it('treats only Delivered as finished', () => {
    expect(isDeliveryFinished('Delivered')).toBe(true)
    expect(isDeliveryFinished('Failed')).toBe(false)
  })
})
