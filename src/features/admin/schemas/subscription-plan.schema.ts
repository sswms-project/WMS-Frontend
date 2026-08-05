import { z } from 'zod'

// Backend lưu Price dạng decimal(18,2). Giới hạn ở 13 chữ số phần nguyên để giá trị
// quy đổi ra đơn vị nhỏ nhất (x100) vẫn nằm trong Number.MAX_SAFE_INTEGER.
const MAX_PRICE = 9_999_999_999_999.99

// Input number của HTML trả về chuỗi. Đưa chuỗi rỗng về undefined để Zod phân biệt
// được "bỏ trống" với "nhập sai kiểu", thay vì coerce thành 0.
function toOptionalNumber(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return undefined
  return Number(value)
}

function numberIssueMessage(label: string) {
  return (issue: { input: unknown }) =>
    issue.input === undefined ? `${label} là bắt buộc` : `${label} phải là số`
}

// So sánh trên biểu diễn chuỗi thay vì phép nhân float: value * 100 làm tròn sai
// với các giá trị như 10.55 hoặc 10.555.
function hasAtMostTwoDecimalPlaces(value: number): boolean {
  const text = String(value)
  if (text.includes('e') || text.includes('E')) return false
  const decimals = text.split('.')[1]
  return decimals === undefined || decimals.length <= 2
}

const planNameSchema = z
  .string()
  .trim()
  .min(1, 'Tên gói là bắt buộc')
  .max(100, 'Tên gói không được vượt quá 100 ký tự')

const existingPriceSchema = z
  .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage('Giá') }))
  .pipe(
    z
      .number()
      .min(0, 'Giá không được nhỏ hơn 0')
      .max(MAX_PRICE, 'Giá vượt quá giới hạn cho phép')
      .refine(hasAtMostTwoDecimalPlaces, 'Giá chỉ được tối đa 2 chữ số thập phân')
  )

const positivePriceSchema = existingPriceSchema.refine((price) => price > 0, 'Giá phải lớn hơn 0')

function positiveIntSchema(label: string) {
  return z
    .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage(label) }))
    .pipe(z.number().int(`${label} phải là số nguyên`).gt(0, `${label} phải lớn hơn 0`))
}

const planLimitsShape = {
  planName: planNameSchema,
  maxWarehouses: positiveIntSchema('Số kho tối đa'),
  maxUsers: positiveIntSchema('Số người dùng tối đa'),
  enableForecasting: z.boolean(),
  enableBarcode: z.boolean(),
  enableLayoutDesigner: z.boolean(),
}

export const billingCycleSchema = z.enum(['Monthly', 'Yearly'], {
  error: 'Vui lòng chọn chu kỳ thanh toán',
})

export const BILLING_CYCLE_API_VALUES = {
  Monthly: 0,
  Yearly: 1,
} as const

export const createSubscriptionPlanSchema = z.object({
  ...planLimitsShape,
  price: positivePriceSchema,
  billingCycle: billingCycleSchema,
})

// Plan mặc định của môi trường development có giá 0. Form edit cần chấp nhận giá trị
// hiện hữu này để admin sửa field khác; schema payload bên dưới vẫn từ chối gửi giá 0.
export const editSubscriptionPlanSchema = z.object({
  ...planLimitsShape,
  price: existingPriceSchema,
  billingCycle: billingCycleSchema,
})

export const createSubscriptionPlanRequestSchema = z.object({
  ...planLimitsShape,
  price: positivePriceSchema,
  billingCycle: z.union([z.literal(0), z.literal(1)]),
})

export const updateSubscriptionPlanRequestSchema = z.object({
  planName: planNameSchema.optional(),
  price: positivePriceSchema.optional(),
  maxWarehouses: positiveIntSchema('Số kho tối đa').optional(),
  maxUsers: positiveIntSchema('Số người dùng tối đa').optional(),
  enableForecasting: z.boolean().optional(),
  enableBarcode: z.boolean().optional(),
  enableLayoutDesigner: z.boolean().optional(),
})

// Các ô nhập số giữ giá trị dạng chuỗi trước khi preprocess đổi sang number, nên kiểu
// giá trị form (input) khác kiểu dữ liệu sau khi validate (output).
export type SubscriptionPlanFormInput = z.input<typeof createSubscriptionPlanSchema>

export type SubscriptionPlanFormOutput = z.output<typeof createSubscriptionPlanSchema>

export type CreateSubscriptionPlanRequest = z.output<typeof createSubscriptionPlanRequestSchema>

export type UpdateSubscriptionPlanRequest = z.output<typeof updateSubscriptionPlanRequestSchema>
