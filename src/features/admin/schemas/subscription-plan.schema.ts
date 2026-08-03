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

const priceSchema = z
  .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage('Giá') }))
  .pipe(
    z
      .number()
      .gt(0, 'Giá phải lớn hơn 0')
      .max(MAX_PRICE, 'Giá vượt quá giới hạn cho phép')
      .refine(hasAtMostTwoDecimalPlaces, 'Giá chỉ được tối đa 2 chữ số thập phân')
  )

function positiveIntSchema(label: string) {
  return z
    .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage(label) }))
    .pipe(z.number().int(`${label} phải là số nguyên`).gt(0, `${label} phải lớn hơn 0`))
}

const planLimitsShape = {
  planName: planNameSchema,
  price: priceSchema,
  maxWarehouses: positiveIntSchema('Số kho tối đa'),
  maxUsers: positiveIntSchema('Số người dùng tối đa'),
  enableForecasting: z.boolean(),
  enableBarcode: z.boolean(),
  enableLayoutDesigner: z.boolean(),
}

export const createSubscriptionPlanSchema = z.object({
  ...planLimitsShape,
  billingCycle: z.enum(['Monthly', 'Yearly'], { error: 'Vui lòng chọn chu kỳ thanh toán' }),
})

// Backend UpdateSubscriptionPlanCommand không nhận billingCycle nên field này không
// nằm trong schema sửa — ô chọn chu kỳ bị khoá ở chế độ sửa thay vì cho đổi rồi âm
// thầm bỏ qua.
export const editSubscriptionPlanSchema = z.object(planLimitsShape)

// Các ô nhập số giữ giá trị dạng chuỗi trước khi preprocess đổi sang number, nên kiểu
// giá trị form (input) khác kiểu dữ liệu sau khi validate (output).
export type SubscriptionPlanFormInput = z.input<typeof createSubscriptionPlanSchema>

export type SubscriptionPlanFormOutput = z.output<typeof createSubscriptionPlanSchema>
