import { z } from 'zod'

const MAX_PRICE = 9_999_999_999_999.99

function toOptionalNumber(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return undefined
  return Number(value)
}

function numberIssueMessage(label: string) {
  return (issue: { input: unknown }) =>
    issue.input === undefined ? `${label} là bắt buộc` : `${label} phải là số`
}

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

const monthlyPriceSchema = z
  .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage('Giá tháng') }))
  .pipe(
    z
      .number()
      .gt(0, 'Giá tháng phải lớn hơn 0')
      .max(MAX_PRICE, 'Giá vượt quá giới hạn cho phép')
      .refine(hasAtMostTwoDecimalPlaces, 'Giá chỉ được tối đa 2 chữ số thập phân')
  )

const optionalMonthlyPriceSchema = z
  .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage('Giá tháng') }).optional())
  .pipe(
    z
      .number()
      .gt(0, 'Giá tháng phải lớn hơn 0')
      .max(MAX_PRICE, 'Giá vượt quá giới hạn cho phép')
      .refine(hasAtMostTwoDecimalPlaces, 'Giá chỉ được tối đa 2 chữ số thập phân')
      .optional()
  )

const yearlyDiscountSchema = z
  .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage('Chiết khấu năm') }))
  .pipe(z.number().min(0, 'Chiết khấu không được âm').max(100, 'Chiết khấu tối đa 100%'))

function positiveIntSchema(label: string) {
  return z
    .preprocess(toOptionalNumber, z.number({ error: numberIssueMessage(label) }))
    .pipe(z.number().int(`${label} phải là số nguyên`).gt(0, `${label} phải lớn hơn 0`))
}

// Mỗi item tương ứng một FeatureMeta từ API. enabled=false → không gửi lên BE.
// limitValue chỉ validate khi featureType === 'Limit' và enabled === true.
export const featureItemSchema = z
  .object({
    featureCode: z.string(),
    featureType: z.enum(['Boolean', 'Limit']),
    displayName: z.string(),
    description: z.string(),
    enabled: z.boolean(),
    limitValue: z.preprocess(
      toOptionalNumber,
      z
        .number({ error: numberIssueMessage('Giới hạn') })
        .int('Giới hạn phải là số nguyên')
        .optional()
    ),
  })
  .refine(
    (item) =>
      !item.enabled ||
      item.featureType !== 'Limit' ||
      (item.limitValue !== undefined && item.limitValue > 0),
    { message: 'Giới hạn phải lớn hơn 0', path: ['limitValue'] }
  )

export type FeatureItemInput = z.input<typeof featureItemSchema>
export type FeatureItemOutput = z.output<typeof featureItemSchema>

export const createSubscriptionPlanSchema = z.object({
  planName: planNameSchema,
  monthlyPrice: monthlyPriceSchema,
  yearlyDiscountPercent: yearlyDiscountSchema,
  displayOrder: positiveIntSchema('Thứ tự hiển thị'),
  featureItems: z.array(featureItemSchema),
})

export const editSubscriptionPlanSchema = z.object({
  planName: planNameSchema.optional(),
  monthlyPrice: optionalMonthlyPriceSchema,
  yearlyDiscountPercent: z
    .preprocess(
      toOptionalNumber,
      z.number({ error: numberIssueMessage('Chiết khấu năm') }).optional()
    )
    .pipe(z.number().min(0).max(100).optional()),
  displayOrder: positiveIntSchema('Thứ tự hiển thị').optional(),
  featureItems: z.array(featureItemSchema).optional(),
})

export type SubscriptionPlanFormInput = z.input<typeof createSubscriptionPlanSchema>
export type SubscriptionPlanFormOutput = z.output<typeof createSubscriptionPlanSchema>

export type EditSubscriptionPlanFormInput = z.input<typeof editSubscriptionPlanSchema>
export type EditSubscriptionPlanFormOutput = z.output<typeof editSubscriptionPlanSchema>

export interface PlanFeatureInput {
  featureCode: string
  limitValue?: number
  description?: string
}

export interface CreateSubscriptionPlanRequest {
  planName: string
  monthlyPrice: number
  yearlyDiscountPercent: number
  displayOrder: number
  features: PlanFeatureInput[]
}

export interface UpdateSubscriptionPlanRequest {
  planName?: string
  monthlyPrice?: number
  yearlyDiscountPercent?: number
  displayOrder?: number
  features?: PlanFeatureInput[]
  status?: string
}

export function featureItemsToPayload(items: FeatureItemOutput[]): PlanFeatureInput[] {
  return items
    .filter((item) => item.enabled)
    .map((item) => ({
      featureCode: item.featureCode,
      ...(item.featureType === 'Limit' ? { limitValue: item.limitValue } : {}),
      description: item.description,
    }))
}
