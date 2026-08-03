import type { ApiErrorResponse } from '@/types/api'

// Backend không có mã lỗi ổn định, chỉ có message. Hai case dưới đây được so khớp
// theo đúng dạng chuỗi đã xác minh từ source; mọi 409 khác phải rơi vào nhánh lỗi
// không xác định thay vì bị gán nhầm.

// ExceptionMessages.AlreadyExists("SubscriptionPlan", planName) có nội suy tên gói
// nên không so khớp nguyên văn được. Chỉ Create mới kiểm tra trùng tên — handler
// Update không có bước này.
const DUPLICATE_PLAN_NAME_PREFIX = "SubscriptionPlan with value '"
const DUPLICATE_PLAN_NAME_SUFFIX = "' already exists"

const ACTIVE_SUBSCRIBERS_MESSAGE = 'Cannot delete a plan with active subscribers'

export function isDuplicatePlanNameError(error: ApiErrorResponse): boolean {
  return (
    error.statusCode === 409 &&
    error.message.startsWith(DUPLICATE_PLAN_NAME_PREFIX) &&
    error.message.endsWith(DUPLICATE_PLAN_NAME_SUFFIX)
  )
}

export function isActiveSubscribersError(error: ApiErrorResponse): boolean {
  return error.statusCode === 409 && error.message === ACTIVE_SUBSCRIBERS_MESSAGE
}

// FluentValidation trả key dạng PascalCase; form dùng camelCase. Chỉ nhận field nằm
// trong danh sách này, key lạ bị bỏ qua thay vì ép vào React Hook Form.
const SERVER_FIELD_MAP = {
  PlanName: 'planName',
  Price: 'price',
  BillingCycle: 'billingCycle',
  MaxWarehouses: 'maxWarehouses',
  MaxUsers: 'maxUsers',
  EnableForecasting: 'enableForecasting',
  EnableBarcode: 'enableBarcode',
  EnableLayoutDesigner: 'enableLayoutDesigner',
} as const

export type SubscriptionPlanFormField = (typeof SERVER_FIELD_MAP)[keyof typeof SERVER_FIELD_MAP]

export interface ServerFieldError {
  field: SubscriptionPlanFormField
  message: string
}

export function mapServerFieldErrors(
  error: ApiErrorResponse,
  allowedFields: readonly SubscriptionPlanFormField[]
): ServerFieldError[] {
  if (!error.errors) return []

  return Object.entries(error.errors).flatMap<ServerFieldError>(([serverKey, messages]) => {
    const field = SERVER_FIELD_MAP[serverKey as keyof typeof SERVER_FIELD_MAP]
    if (!field || !allowedFields.includes(field)) return []

    const message = messages[0]
    return message ? [{ field, message }] : []
  })
}
