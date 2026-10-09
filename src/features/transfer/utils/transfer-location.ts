export interface TransferLocation {
  readonly slotCode: string
  readonly rackCode?: string | null
  readonly isSystemDefaultSlot?: boolean
  readonly rackId?: string | null
}

/** Vị trí mặc định của kệ dùng chung mã nội bộ, nên hiển thị và quét theo mã kệ. */
export function formatTransferLocation(location: TransferLocation): string {
  return location.isSystemDefaultSlot && location.rackCode
    ? `Kệ ${location.rackCode}`
    : location.slotCode
}

/** Giá trị mã vạch trên nhãn in từ trang mã vạch vị trí (khớp BE: KOVIA:LOC:{loại}:{id}). */
const locationLabel = (type: 'SLOT' | 'RACK', id: string) => `KOVIA:LOC:${type}:${id}`

/**
 * Mã người dùng có thể quét để xác nhận vị trí: mã vị trí, mã barcode, giá trị trên nhãn đã in và
 * (với vị trí mặc định) mã kệ hoặc nhãn kệ.
 */
export function transferLocationScanCodes(
  location: TransferLocation & {
    readonly slotBarcode?: string | null
    readonly slotId?: string | null
  }
): string[] {
  const codes = [
    location.slotCode,
    location.slotBarcode,
    location.slotId ? locationLabel('SLOT', location.slotId) : null,
  ]
  if (location.isSystemDefaultSlot) {
    codes.push(location.rackCode, location.rackId ? locationLabel('RACK', location.rackId) : null)
  }
  return codes.filter((code): code is string => Boolean(code))
}
