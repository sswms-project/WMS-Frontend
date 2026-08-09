import { z } from 'zod'

const addressSchema = z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự.')

export const createWarehouseSchema = z.object({
  warehouseCode: z.string().trim().min(1, 'Mã kho là bắt buộc.').max(50, 'Mã kho tối đa 50 ký tự.'),
  warehouseName: z
    .string()
    .trim()
    .min(1, 'Tên kho là bắt buộc.')
    .max(255, 'Tên kho tối đa 255 ký tự.'),
  address: addressSchema,
})

export const updateWarehouseSchema = z.object({
  warehouseName: z
    .string()
    .trim()
    .min(1, 'Tên kho là bắt buộc.')
    .max(255, 'Tên kho tối đa 255 ký tự.'),
  address: addressSchema,
})

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseFormValues = z.infer<typeof updateWarehouseSchema>
