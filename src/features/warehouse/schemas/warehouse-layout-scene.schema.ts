import { z } from 'zod'

const geometryNumber = z.number().finite().min(0, 'Giá trị không được âm.')

export const warehouseLayoutGeometrySchema = z.object({
  x: geometryNumber,
  y: geometryNumber,
  width: z.number().finite().min(1, 'Chiều rộng tối thiểu là 1.'),
  height: z.number().finite().min(1, 'Chiều cao tối thiểu là 1.'),
  rotation: z.number().finite().min(0).max(359, 'Góc xoay phải nhỏ hơn 360 độ.'),
  zIndex: z.number().int().min(-1000).max(1000),
})

export const warehouseLayoutCanvasSchema = z
  .object({
    width: z.number().finite().min(100).max(100000),
    height: z.number().finite().min(100).max(100000),
    gridSize: z.number().finite().min(1).max(1000),
  })
  .refine((canvas) => canvas.gridSize <= Math.min(canvas.width, canvas.height), {
    message: 'Kích thước lưới không được lớn hơn nền.',
    path: ['gridSize'],
  })

export const warehouseLayoutDecorationSchema = warehouseLayoutGeometrySchema.extend({
  label: z.string().trim().min(1, 'Tên đối tượng là bắt buộc.').max(100),
  type: z.enum(['Door', 'Aisle', 'Receiving', 'Packing', 'Picking', 'Damaged', 'Office', 'Other']),
})

export type WarehouseLayoutGeometryFormValues = z.infer<typeof warehouseLayoutGeometrySchema>
export type WarehouseLayoutCanvasFormValues = z.infer<typeof warehouseLayoutCanvasSchema>
export type WarehouseLayoutDecorationFormValues = z.infer<typeof warehouseLayoutDecorationSchema>
