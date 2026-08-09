import type { ApiErrorResponse } from '@/types/api'

const duplicateWarehouseCodeMessage = 'Mã kho đã tồn tại. Vui lòng chọn mã khác.'

export function getWarehouseCodeError(error: ApiErrorResponse) {
  if (error.statusCode === 409) return duplicateWarehouseCodeMessage

  const fieldErrors = error.errors?.warehouseCode ?? error.errors?.WarehouseCode
  return fieldErrors?.find((message) => message.trim().length > 0)
}
