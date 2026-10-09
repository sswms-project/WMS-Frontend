import { describe, expect, it } from 'vitest'
import { formatTransferLocation, transferLocationScanCodes } from './transfer-location'

describe('transfer location helpers', () => {
  it('shows the rack for the system default slot and the slot code otherwise', () => {
    expect(
      formatTransferLocation({
        slotCode: '__SYSTEM_DEFAULT__',
        rackCode: 'A07',
        isSystemDefaultSlot: true,
      })
    ).toBe('Kệ A07')
    expect(formatTransferLocation({ slotCode: 'A07-01', rackCode: 'A07' })).toBe('A07-01')
    expect(
      formatTransferLocation({ slotCode: '__SYSTEM_DEFAULT__', isSystemDefaultSlot: true })
    ).toBe('__SYSTEM_DEFAULT__')
  })

  it('accepts the rack code only for the system default slot', () => {
    expect(
      transferLocationScanCodes({
        slotCode: '__SYSTEM_DEFAULT__',
        rackCode: 'A07',
        isSystemDefaultSlot: true,
        slotBarcode: null,
      })
    ).toEqual(['__SYSTEM_DEFAULT__', 'A07'])
    expect(
      transferLocationScanCodes({ slotCode: 'A07-01', rackCode: 'A07', slotBarcode: 'BC' })
    ).toEqual(['A07-01', 'BC'])
  })

  it('also accepts the value printed on the location barcode label', () => {
    const slot = {
      slotCode: 'A-01',
      slotId: '11111111-1111-4111-8111-111111111111',
      rackId: '22222222-2222-4222-8222-222222222222',
      rackCode: 'A01',
      isSystemDefaultSlot: false,
    }
    expect(transferLocationScanCodes(slot)).toContain(
      'KOVIA:LOC:SLOT:11111111-1111-4111-8111-111111111111'
    )
    expect(transferLocationScanCodes(slot)).not.toContain(
      'KOVIA:LOC:RACK:22222222-2222-4222-8222-222222222222'
    )
    expect(transferLocationScanCodes({ ...slot, isSystemDefaultSlot: true })).toContain(
      'KOVIA:LOC:RACK:22222222-2222-4222-8222-222222222222'
    )
  })
})
