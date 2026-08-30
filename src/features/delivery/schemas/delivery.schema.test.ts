import { describe, expect, it } from 'vitest'
import { updateDeliveryStatusSchema } from './delivery.schema'
import { getNextDeliveryStatuses } from '../utils/delivery-format'

describe('delivery transitions and validation', () => {
  it('matches the backend transition graph', () => {
    expect(getNextDeliveryStatuses('ReadyToShip')).toEqual(['AssignedToTransport'])
    expect(getNextDeliveryStatuses('AssignedToTransport')).toEqual(['Shipping', 'Failed'])
    expect(getNextDeliveryStatuses('Shipping')).toEqual(['Delivered', 'Failed'])
    expect(getNextDeliveryStatuses('Failed')).toEqual(['AssignedToTransport'])
    expect(getNextDeliveryStatuses('Delivered')).toEqual([])
  })

  it('requires assignment and failed reason', () => {
    expect(
      updateDeliveryStatusSchema.safeParse({
        newStatus: 'AssignedToTransport',
        note: '',
        assignedDeliveryStaffId: null,
      }).success
    ).toBe(false)
    expect(
      updateDeliveryStatusSchema.safeParse({
        newStatus: 'Failed',
        note: '',
        assignedDeliveryStaffId: null,
      }).success
    ).toBe(false)
    expect(
      updateDeliveryStatusSchema.safeParse({
        newStatus: 'Failed',
        note: 'Không liên lạc được',
        assignedDeliveryStaffId: null,
      }).success
    ).toBe(true)
  })
})
