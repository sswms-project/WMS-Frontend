export interface TransferLocation {
  readonly slotCode: string
  readonly rackCode?: string | null
  readonly isSystemDefaultSlot?: boolean
}

/** Vị trí mặc định của kệ dùng chung mã nội bộ, nên hiển thị và quét theo mã kệ. */
export function formatTransferLocation(location: TransferLocation): string {
  return location.isSystemDefaultSlot && location.rackCode
    ? `Kệ ${location.rackCode}`
    : location.slotCode
}

/** Mã người dùng có thể quét để xác nhận vị trí: mã vị trí, mã barcode và (với vị trí mặc định) mã kệ. */
export function transferLocationScanCodes(
  location: TransferLocation & { readonly slotBarcode?: string | null }
): string[] {
  const codes = [location.slotCode, location.slotBarcode]
  if (location.isSystemDefaultSlot) codes.push(location.rackCode)
  return codes.filter((code): code is string => Boolean(code))
}
