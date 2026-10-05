import { z } from 'zod'

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ.')

function todayIsoDate() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

export const staffEmploymentPeriodSchema = z
  .object({
    startDate: isoDateSchema,
    endDate: z.union([isoDateSchema, z.literal('')]),
  })
  .superRefine((values, context) => {
    const today = todayIsoDate()
    if (values.startDate > today) {
      context.addIssue({
        code: 'custom',
        path: ['startDate'],
        message: 'Ngày làm việc không được ở tương lai.',
      })
    }
    if (values.endDate && values.endDate > today) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Ngày làm việc không được ở tương lai.',
      })
    }
    if (values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Ngày kết thúc không được trước ngày bắt đầu.',
      })
    }
  })

export type StaffEmploymentPeriodFormValues = z.infer<typeof staffEmploymentPeriodSchema>
