import { z } from 'zod'

export const warehouseTaskScheduleSchema = z
  .object({
    priority: z.enum(['Normal', 'Urgent']),
    dueAt: z.string(),
    reason: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập lý do thay đổi lịch công việc.')
      .max(500, 'Lý do không được vượt quá 500 ký tự.'),
  })
  .superRefine((values, context) => {
    if (values.priority === 'Urgent' && !values.dueAt) {
      context.addIssue({
        code: 'custom',
        path: ['dueAt'],
        message: 'Công việc khẩn phải có hạn hoàn thành.',
      })
    }
    if (values.dueAt && new Date(values.dueAt).getTime() <= Date.now()) {
      context.addIssue({
        code: 'custom',
        path: ['dueAt'],
        message: 'Hạn hoàn thành mới phải ở tương lai.',
      })
    }
  })

export type WarehouseTaskScheduleFormValues = z.infer<typeof warehouseTaskScheduleSchema>
